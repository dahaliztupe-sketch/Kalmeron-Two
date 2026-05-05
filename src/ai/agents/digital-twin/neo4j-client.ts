import neo4j, { Driver, Session } from 'neo4j-driver';

let _driver: Driver | null = null;

function getDriver(): Driver | null {
  if (_driver) return _driver;

  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    console.warn(
      '[neo4j-client] NEO4J_URI, NEO4J_USERNAME, or NEO4J_PASSWORD is not set. ' +
      'Neo4j features are disabled. Set these env vars to enable the Digital Twin graph.'
    );
    return null;
  }

  try {
    _driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    return _driver;
  } catch (err) {
    console.error('[neo4j-client] Failed to create Neo4j driver:', err);
    return null;
  }
}

export function getSession(): Session | null {
  const driver = getDriver();
  if (!driver) return null;
  return driver.session();
}

export async function runCypher(
  query: string,
  params: Record<string, unknown> = {}
): Promise<{ records: Array<Record<string, unknown>> } | null> {
  const session = getSession();
  if (!session) {
    throw new Error(
      '[neo4j-client] Neo4j is not configured. Please set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD.'
    );
  }
  try {
    const result = await session.run(query, params);
    const records = result.records.map((r) => {
      const obj: Record<string, unknown> = {};
      r.keys.forEach((key) => {
        obj[key as string] = r.get(key as string);
      });
      return obj;
    });
    return { records };
  } finally {
    await session.close();
  }
}

export function isNeo4jConfigured(): boolean {
  return !!(
    process.env.NEO4J_URI &&
    process.env.NEO4J_USERNAME &&
    process.env.NEO4J_PASSWORD
  );
}
