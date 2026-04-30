import { getBootstrapSkillsAddon, listLoadedSkillsForAgent } from '../src/lib/agent-skills/runtime-loader.ts';
const agents = ['cfo_agent', 'idea_validator', 'plan_builder', 'mistake_shield', 'opportunity_radar', 'legal_guide', 'persona_generator', 'customer_support', 'general_chat'];
for (const a of agents) {
  const skills = listLoadedSkillsForAgent(a);
  const addon = getBootstrapSkillsAddon(a);
  console.log(`\n[${a}] ${skills.length} skills loaded, addon=${addon.length} chars`);
  for (const s of skills) console.log(`  • ${s.name}: ${s.description.slice(0,80)}...`);
}
