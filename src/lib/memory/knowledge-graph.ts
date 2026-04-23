// @ts-nocheck
/**
 * Knowledge Graph (Neo4j) — الدماغ المشترك للمنصة
 *
 * طبقة وصول إلى Neo4j تتعامل بأمان مع غياب الاعتمادات (no-op fallback).
 * جميع الكتابات/القراءات تتم عبر مشاريع (project nodes) لكل userId.
 */
import neo4j, { Driver, Session } from 'neo4j-driver';
import { logger } from '@/src/lib/logger';

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USERNAME || process.env.NEO4J_USER;
const PASS = process.env.NEO4J_PASSWORD;

let driver: Driver | null = null;
let warned = false;

function getDriver(): Driver | null {
  if (driver) return driver;
  if (!URI || !USER || !PASS) {
    if (!warned) {
      warned = true;
      logger?.warn?.({ msg: 'KG_DISABLED', reason: 'NEO4J credentials missing' })
        ?? console.warn('[knowledge-graph] disabled: missing NEO4J_URI/USER/PASSWORD');
    }
    return null;
  }
  driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASS), {
    maxConnectionPoolSize: 10,
    connectionAcquisitionTimeout: 5000,
  });
  return driver;
}

async function withSession<T>(fn: (s: Session) => Promise<T>): Promise<T | null> {
  const d = getDriver();
  if (!d) return null;
  const session = d.session();
  try {
    return await fn(session);
  } catch (e: any) {
    logger?.error?.({ msg: 'KG_QUERY_FAILED', error: e?.message }) ?? console.error('[KG]', e?.message);
    return null;
  } finally {
    await session.close().catch(() => {});
  }
}

export interface Entity {
  id?: string;
  type: string;
  properties: Record<string, any>;
}

/** Add or merge an entity scoped to a user/project. */
export async function addEntity(userId: string, type: string, properties: Record<string, any>) {
  const id = properties.id || `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return withSession(async (s) => {
    const res = await s.run(
      `MERGE (u:User {userId: $userId})
       WITH u
       MERGE (e:${sanitizeLabel(type)} {id: $id})
       SET e += $props, e.userId = $userId, e.updatedAt = timestamp()
       MERGE (u)-[:OWNS]->(e)
       RETURN e`,
      { userId, id, props: properties },
    );
    return res.records[0]?.get('e')?.properties || { id, ...properties };
  });
}

/** Connect two existing entities. */
export async function addRelationship(
  userId: string,
  fromId: string,
  toId: string,
  relationType: string,
  properties: Record<string, any> = {},
) {
  return withSession(async (s) => {
    await s.run(
      `MATCH (a {id: $fromId, userId: $userId}), (b {id: $toId, userId: $userId})
       MERGE (a)-[r:${sanitizeLabel(relationType)}]->(b)
       SET r += $props, r.updatedAt = timestamp()
       RETURN r`,
      { userId, fromId, toId, props: properties },
    );
    return true;
  });
}

/** Run an arbitrary read-only Cypher query (use cautiously). */
export async function queryGraph(cypher: string, params: Record<string, any> = {}) {
  return withSession(async (s) => {
    const res = await s.run(cypher, params);
    return res.records.map((r) => Object.fromEntries(r.keys.map((k) => [k, r.get(k)])));
  });
}

/** Full-text search over a user's entities by name/title/description. */
export async function searchEntities(userId: string, term: string, limit = 20) {
  return withSession(async (s) => {
    const res = await s.run(
      `MATCH (u:User {userId: $userId})-[:OWNS]->(e)
       WHERE toLower(coalesce(e.name, e.title, e.description, '')) CONTAINS toLower($term)
       RETURN e LIMIT $limit`,
      { userId, term, limit: neo4j.int(limit) },
    );
    return res.records.map((r) => r.get('e').properties);
  });
}

/** Get a full overview (all nodes + edges) for a user. */
export async function getProjectOverview(userId: string, limit = 200) {
  return withSession(async (s) => {
    const res = await s.run(
      `MATCH (u:User {userId: $userId})-[:OWNS]->(e)
       OPTIONAL MATCH (e)-[r]->(target)
       RETURN e, type(r) AS rel, target LIMIT $limit`,
      { userId, limit: neo4j.int(limit) },
    );
    const nodes = new Map<string, any>();
    const edges: any[] = [];
    for (const rec of res.records) {
      const e = rec.get('e').properties;
      nodes.set(e.id, e);
      const rel = rec.get('rel');
      const target = rec.get('target');
      if (rel && target) {
        const t = target.properties;
        nodes.set(t.id, t);
        edges.push({ from: e.id, to: t.id, type: rel });
      }
    }
    return { nodes: Array.from(nodes.values()), edges };
  });
}

export async function isKnowledgeGraphEnabled() {
  return Boolean(getDriver());
}

function sanitizeLabel(label: string) {
  return label.replace(/[^a-zA-Z0-9_]/g, '_');
}

export async function closeKnowledgeGraph() {
  if (driver) { await driver.close(); driver = null; }
}
