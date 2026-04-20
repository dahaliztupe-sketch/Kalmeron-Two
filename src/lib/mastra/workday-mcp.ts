// @ts-nocheck
import { Mastra } from '@mastra/core';

/**
 * دمج Workday MCP للوصول الآمن لبيانات HRIS والموظفين
 * باستخدام بروتوكول سياق النماذج (MCP) و Composio Integration في بيئة 2026.
 */
export async function setupWorkdayMCP() {
  const mastra = new Mastra();
  
  // الاتصال بـ Workday MCP من خلال Composio
  try {
    // In production 2026, connectMCP loads the standard context tools into the Mastra global state
    await mastra.connectMCP({
      serverUrl: process.env.COMPOSIO_WORKDAY_MCP_URL || 'https://mcp.composio.dev/api/workday',
      toolsets: ['workday_core', 'workday_recruiting', 'workday_compensation'],
    });

    console.log("Workday MCP Tools Loaded successfully.");
  } catch (err) {
    console.error("Failed connecting to Workday MCP Orchestrator:", err);
  }
  
  return mastra;
}
