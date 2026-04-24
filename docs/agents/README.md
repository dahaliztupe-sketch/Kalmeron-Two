# Agent System Cards

Each card describes one production agent so customers, auditors, and the EU AI Act
compliance officer can answer: *what does it do, what doesn't it do, what data does
it touch, what failure modes do we know about?*

## Index

| Agent | File | Department | Risk class |
|---|---|---|---|
| Idea Validator | [`idea-validator.md`](./idea-validator.md) | Strategy | Limited |
| Business Plan Builder | [`plan-builder.md`](./plan-builder.md) | Strategy | Limited |
| Mistake Shield | [`mistake-shield.md`](./mistake-shield.md) | Strategy | Limited |
| Success Museum | [`success-museum.md`](./success-museum.md) | Research | Minimal |
| Opportunity Radar | [`opportunity-radar.md`](./opportunity-radar.md) | Research | Limited |
| CFO Agent | [`cfo.md`](./cfo.md) | Finance | Limited |
| Legal Guide | [`legal-guide.md`](./legal-guide.md) | Legal | **High** (legal advice domain) |
| Real Estate | [`real-estate.md`](./real-estate.md) | Vertical | Limited |
| General Chat | [`general-chat.md`](./general-chat.md) | Support | Minimal |

> Risk classes follow EU AI Act terminology (Minimal / Limited / High / Unacceptable).
> Any "High" agent must additionally publish a Data Protection Impact Assessment
> (DPIA) — see `docs/dpia/`.

## Card template

Use [`_TEMPLATE.md`](./_TEMPLATE.md) when adding a new agent.
