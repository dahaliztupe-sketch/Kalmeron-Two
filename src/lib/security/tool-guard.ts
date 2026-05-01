// src/lib/security/tool-guard.ts
export class ToolGuard {
  private allowedTools: Map<string, string[]> = new Map([
    ['idea-validator', ['analyze_market', 'search_competitors']],
    ['plan-builder', ['generate_business_plan', 'create_financial_model']],
    ['cfo-agent', ['run_scenario', 'forecast_cashflow']],
  ]);
  
  validateToolAccess(agentName: string, toolName: string): boolean {
    const allowed = this.allowedTools.get(agentName) || [];
    return allowed.includes(toolName);
  }
  
  // الأدوات الحساسة تتطلب موافقة المستخدم
  requiresUserConsent(toolName: string): boolean {
    const sensitiveTools = ['delete_user_data', 'send_email', 'make_payment'];
    return sensitiveTools.includes(toolName);
  }
}
