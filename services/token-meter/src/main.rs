//! token-meter — high-throughput BPE token counter as an HTTP microservice.
//!
//! Why this exists in Rust (and not in the Next.js process):
//!   * Token counting is a hot path for any LLM-powered application — every
//!     prompt goes through it for cost estimation and context-window guards.
//!   * The reference JS port `gpt-tokenizer` is fast-ish, but on long inputs
//!     (tens of KB) it allocates heavily and pegs the Node event loop. The
//!     Rust crate `tiktoken-rs` is 10-50x faster and runs in a separate
//!     process, so it can never stall the web server's request loop.
//!   * Keeping it as an isolated service means we can swap the encoder
//!     (cl100k, o200k, etc.) without touching the front-end build.
//!
//! Endpoints:
//!   GET  /health                  liveness probe
//!   POST /count   { text, model } { tokens, encoding, ms }
//!
//! Configuration:
//!   TOKEN_METER_PORT   default 8090
//!   RUST_LOG           default info
//!
//! Run locally:
//!   cd services/token-meter
//!   cargo run --release

use axum::{extract::State, http::StatusCode, routing::{get, post}, Json, Router};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, env, net::SocketAddr, sync::Arc, time::Instant};
use tiktoken_rs::CoreBPE;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

/// Map an OpenAI/Anthropic/Gemini model name to its encoding family.
/// Anthropic and Gemini don't publish their tokenizers, but cl100k_base /
/// o200k_base are widely-used approximations within ±5% accuracy.
fn encoding_for(model: &str) -> &'static str {
    let m = model.to_ascii_lowercase();
    if m.starts_with("gpt-4o") || m.starts_with("o1") || m.starts_with("o3") || m.starts_with("o4") {
        "o200k_base"
    } else if m.starts_with("gpt-4") || m.starts_with("gpt-3.5") || m.starts_with("text-embedding") {
        "cl100k_base"
    } else if m.starts_with("claude") || m.starts_with("gemini") {
        // Best-available approximation — the upstream tokenizers are closed.
        "cl100k_base"
    } else {
        "cl100k_base"
    }
}

fn load_encoder(name: &str) -> Result<CoreBPE, String> {
    match name {
        "cl100k_base" => tiktoken_rs::cl100k_base().map_err(|e| e.to_string()),
        "o200k_base" => tiktoken_rs::o200k_base().map_err(|e| e.to_string()),
        "p50k_base" => tiktoken_rs::p50k_base().map_err(|e| e.to_string()),
        "r50k_base" => tiktoken_rs::r50k_base().map_err(|e| e.to_string()),
        other => Err(format!("unknown encoding: {other}")),
    }
}

/// Process-wide cache of encoders. Loading the BPE merge table is the slow
/// part (~30 ms cold), so we do it once per encoding.
struct AppState {
    encoders: std::sync::Mutex<HashMap<String, Arc<CoreBPE>>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            encoders: std::sync::Mutex::new(HashMap::new()),
        }
    }

    fn get(&self, name: &str) -> Result<Arc<CoreBPE>, String> {
        {
            let cache = self.encoders.lock().unwrap();
            if let Some(e) = cache.get(name) {
                return Ok(Arc::clone(e));
            }
        }
        let enc = Arc::new(load_encoder(name)?);
        self.encoders
            .lock()
            .unwrap()
            .insert(name.to_string(), Arc::clone(&enc));
        Ok(enc)
    }
}

static START_TIME: Lazy<Instant> = Lazy::new(Instant::now);

#[derive(Serialize)]
struct Health {
    status: &'static str,
    service: &'static str,
    uptime_seconds: u64,
}

async fn health() -> Json<Health> {
    Json(Health {
        status: "ok",
        service: "token-meter",
        uptime_seconds: START_TIME.elapsed().as_secs(),
    })
}

#[derive(Deserialize)]
struct CountRequest {
    text: String,
    /// Optional — if omitted, defaults to cl100k_base. Otherwise the encoding
    /// is selected from the model name (e.g. "gpt-4o" -> "o200k_base").
    #[serde(default)]
    model: Option<String>,
    /// Optional explicit encoding override.
    #[serde(default)]
    encoding: Option<String>,
}

#[derive(Serialize)]
struct CountResponse {
    tokens: usize,
    bytes: usize,
    encoding: String,
    /// Wall-clock encoding time on the server (excludes network).
    elapsed_micros: u128,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

async fn count(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CountRequest>,
) -> Result<Json<CountResponse>, (StatusCode, Json<ErrorResponse>)> {
    let encoding_name = req
        .encoding
        .clone()
        .unwrap_or_else(|| encoding_for(req.model.as_deref().unwrap_or("")).to_string());

    let enc = state
        .get(&encoding_name)
        .map_err(|e| (StatusCode::BAD_REQUEST, Json(ErrorResponse { error: e })))?;

    let bytes = req.text.len();
    let started = Instant::now();
    let tokens = enc.encode_with_special_tokens(&req.text).len();
    let elapsed_micros = started.elapsed().as_micros();

    Ok(Json(CountResponse {
        tokens,
        bytes,
        encoding: encoding_name,
        elapsed_micros,
    }))
}

#[tokio::main]
async fn main() {
    Lazy::force(&START_TIME);

    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(tracing_subscriber::fmt::layer().compact())
        .init();

    let state = Arc::new(AppState::new());

    // Warm the default encoder so the first real request is fast.
    if let Err(e) = state.get("cl100k_base") {
        tracing::warn!("failed to preload cl100k_base: {e}");
    }

    let app = Router::new()
        .route("/health", get(health))
        .route("/count", post(count))
        .with_state(state)
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .layer(TraceLayer::new_for_http());

    let port: u16 = env::var("TOKEN_METER_PORT")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(9000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    tracing::info!("token-meter listening on http://{addr}");
    let listener = tokio::net::TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("serve");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c().await.ok();
    };
    #[cfg(unix)]
    let term = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("signal handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let term = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = term => {},
    }
    tracing::info!("shutdown signal received");
}
