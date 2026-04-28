#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const WF_DIR = path.join(ROOT, ".github/workflows");

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const headers = {
  "User-Agent": "kalmeron-pin-actions",
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

// Allowlist: only api.github.com (https) is permitted. Mitigates CodeQL
// "Network data written to file" / "File data in outbound network request"
// by ensuring URLs cannot be redirected to arbitrary hosts/protocols.
const ALLOWED_HOSTS = new Set(["api.github.com"]);

function assertSafeUrl(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error(`pin-actions: invalid URL: ${rawUrl}`);
  }
  if (u.protocol !== "https:") {
    throw new Error(`pin-actions: refusing non-https URL: ${rawUrl}`);
  }
  if (!ALLOWED_HOSTS.has(u.hostname)) {
    throw new Error(`pin-actions: host not allowlisted: ${u.hostname}`);
  }
  return u.toString();
}

async function gh(url) {
  const safeUrl = assertSafeUrl(url);
  const res = await fetch(safeUrl, { headers, redirect: "error" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${safeUrl}`);
  return res.json();
}

async function resolveSha(owner, repo, ref) {
  try {
    const tag = await gh(`https://api.github.com/repos/${owner}/${repo}/git/ref/tags/${ref}`);
    if (tag?.object?.type === "tag") {
      const t = await gh(tag.object.url);
      return t.object?.sha || tag.object.sha;
    }
    if (tag?.object?.sha) return tag.object.sha;
  } catch {}
  try {
    const br = await gh(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${ref}`);
    if (br?.object?.sha) return br.object.sha;
  } catch {}
  try {
    const c = await gh(`https://api.github.com/repos/${owner}/${repo}/commits/${ref}`);
    if (c?.sha) return c.sha;
  } catch {}
  return null;
}

async function main() {
  const files = (await fs.readdir(WF_DIR)).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
  const usePattern = /(\s*(?:-\s+)?uses:\s*)(["']?)([^"'\s@]+)@([^"'\s#]+)(["']?)/g;

  const cache = new Map();
  let totalChanges = 0;

  for (const f of files) {
    const fp = path.join(WF_DIR, f);
    let content = await fs.readFile(fp, "utf8");
    const original = content;
    const lines = content.split(/\n/);
    const out = [];
    for (const line of lines) {
      // Skip comments
      if (/^\s*#/.test(line)) {
        out.push(line);
        continue;
      }
      const m = line.match(/^(\s*(?:-\s+)?uses:\s*)(["']?)([^"'\s@]+)@([^"'\s#]+)(["']?)(\s*(?:#.*)?)$/);
      if (!m) {
        out.push(line);
        continue;
      }
      const [, prefix, q1, ref, version, q2, suffix] = m;
      // Skip if already pinned to a 40-char SHA
      if (/^[0-9a-f]{40}$/i.test(version)) {
        out.push(line);
        continue;
      }
      // Determine owner/repo from "owner/repo" or "owner/repo/path"
      const refParts = ref.split("/");
      if (refParts.length < 2) {
        out.push(line);
        continue;
      }
      const owner = refParts[0];
      const repo = refParts[1];
      const cacheKey = `${owner}/${repo}@${version}`;
      let sha = cache.get(cacheKey);
      if (!sha) {
        process.stderr.write(`Resolving ${cacheKey}... `);
        sha = await resolveSha(owner, repo, version);
        if (!sha) {
          process.stderr.write(`SKIP (no SHA found)\n`);
          out.push(line);
          continue;
        }
        process.stderr.write(`${sha.slice(0, 10)}\n`);
        cache.set(cacheKey, sha);
      }
      const newLine = `${prefix}${q1}${ref}@${sha}${q2} # ${version}${suffix.replace(/^\s*#.*$/, "")}`;
      out.push(newLine);
      totalChanges++;
    }
    content = out.join("\n");
    if (content !== original) {
      await fs.writeFile(fp, content, "utf8");
      console.log(`Updated: ${f}`);
    }
  }
  console.log(`\nDone. ${totalChanges} pin(s) applied across ${files.length} workflow(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
