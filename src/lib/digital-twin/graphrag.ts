import { runCypher, isNeo4jConfigured } from '@/src/ai/agents/digital-twin/neo4j-client';

export async function getCompanyContext(startupId: string): Promise<string> {
  if (!isNeo4jConfigured()) {
    console.warn('[graphrag] Neo4j not configured — returning empty context.');
    return '';
  }

  try {
    const [startupResult, foundersResult, productsResult, competitorsResult, metricsResult, milestonesResult] =
      await Promise.all([
        runCypher(
          `MATCH (n:Startup {startupId: $startupId}) RETURN properties(n) AS props LIMIT 1`,
          { startupId }
        ),
        runCypher(
          `MATCH (n:Founder {startupId: $startupId}) RETURN properties(n) AS props`,
          { startupId }
        ),
        runCypher(
          `MATCH (n:Product {startupId: $startupId}) RETURN properties(n) AS props`,
          { startupId }
        ),
        runCypher(
          `MATCH (n:Competitor {startupId: $startupId}) RETURN properties(n) AS props`,
          { startupId }
        ),
        runCypher(
          `MATCH (n:Metric {startupId: $startupId}) RETURN properties(n) AS props`,
          { startupId }
        ),
        runCypher(
          `MATCH (n:Milestone {startupId: $startupId}) RETURN properties(n) AS props`,
          { startupId }
        ),
      ]);

    const fmt = (label: string, result: { records: Array<Record<string, unknown>> } | null) => {
      if (!result?.records.length) return '';
      const items = result.records.map((r) => {
        const props = r.props as Record<string, unknown>;
        return Object.entries(props)
          .filter(([k]) => !['startupId', 'createdAt', 'updatedAt'].includes(k))
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
      });
      return `### ${label}\n${items.map((i) => `- ${i}`).join('\n')}`;
    };

    const sections = [
      fmt('الشركة', startupResult),
      fmt('المؤسسون', foundersResult),
      fmt('المنتجات', productsResult),
      fmt('المنافسون', competitorsResult),
      fmt('المقاييس', metricsResult),
      fmt('المعالم', milestonesResult),
    ].filter(Boolean);

    if (!sections.length) return '';

    return `## سياق الشركة الناشئة (${startupId})\n\n${sections.join('\n\n')}`;
  } catch (err) {
    console.error('[graphrag] getCompanyContext failed:', err);
    return '';
  }
}

export class GraphRAG {
  async retrieveContext(startupId: string, _query: string): Promise<string> {
    return getCompanyContext(startupId);
  }
}
