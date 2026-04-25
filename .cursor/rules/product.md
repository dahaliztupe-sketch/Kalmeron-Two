---
description: السياق المنتجي والتجاري لمنصّة Kalmeron AI
alwaysApply: true
---

# Product Context — Kalmeron AI

## 1. ما هي كلميرون؟
مقرّ عمليّات (Operations Hub) ذكي للشركات الناشئة العربية. تستبدل توظيف 16 موظّفاً متخصّصاً بـ 16 وكيل ذكاء اصطناعي يعملون متكاملين.

## 2. الجمهور
- **الأساسي:** مؤسّسو شركات في المرحلة Pre-seed → Seed في **مصر** (أوّلاً)، ثمّ السعودية والإمارات.
- **الثانوي:** Solopreneurs، فِرَق صغيرة (≤5 أشخاص).
- **اللغة الأمّ للمستخدم:** عربيّة مصريّة (Hero copy + Marketing)، فصحى مبسّطة (UI، التقارير).

## 3. الوكلاء الـ 16

| القسم | الوكيل | المهمّة |
|---|---|---|
| Strategy | Idea Validator | تقييم فكرة في 3 أبعاد + Scoring 0-100 |
| Strategy | Plan Builder | خطّة عمل بـ 9 أقسام (Lean Canvas + Financial) |
| Strategy | Mistake Shield | يُحذّر من أخطاء 13,000 startup فاشلة |
| Research | Success Museum | معرض قصص نجاح مع تحليل أنماط |
| Research | Opportunity Radar | يرصد فرص سوقيّة من Google Trends + News |
| Finance | CFO Agent | تدفّق نقدي + Burn rate + توقّعات + ضرائب مصريّة |
| Legal | Legal Guide | إجابات قانونيّة استرشاديّة (مصري + سعودي) |
| Vertical | Real Estate | تحليل عقارات تجاريّة |
| HR | HR Co-Pilot | توصيف وظائف + scorecards + check-ins |
| Marketing | Marketing Strategist | استراتيجيّات + محتوى + تخطيط حملات |
| Sales | Sales Operator | playbooks + email sequences + lead scoring |
| Operations | Operations Coach | SOPs + KPIs + retro meetings |
| Product | Product Mentor | discovery + roadmap + spec writing |
| Investor | Investor Liaison | Pitch decks + tracking VCs + warm intros |
| Customer | Customer Voice | NPS + feedback synthesis + churn analysis |
| Support | General Chat | بوّابة الدخول العامّة (router لباقي الوكلاء) |

> **مرجع كامل:** `docs/agents/*.md` — كل وكيل له System Card.

## 4. عرض القيمة الأساسي
> "بدل ما توظّف 16 شخص بـ 50,000 ج.م/شهر، اشترك بـ 499 ج.م/شهر."

## 5. التسعير (مصر — مُسوَّد)
- **Free:** 100 رسالة/شهر، وكيلان، رصيد 500 token.
- **Starter:** 99 ج.م/شهر، 1,000 رسالة، 5 وكلاء.
- **Growth:** 499 ج.م/شهر، غير محدود، كل الـ 16 وكيلاً + Stripe.
- **Scale:** 1,499 ج.م/شهر، Workspace + 5 أعضاء + API access.

## 6. القنوات
- Web app (PWA installable)
- WhatsApp Bot (`app/api/webhooks/whatsapp/`)
- Telegram Bot
- Email (SendGrid)
- MCP Server (`/api/mcp-server`) — استدعاء الوكلاء من Cursor/Claude

## 7. ميزات تفاضليّة (لا تكسرها بدون نقاش)
- **عربيّة أصيلة** — لا ترجمة آليّة.
- **بيانات سياقيّة مصريّة** — قانون، ضرائب، أسعار محلّيّة.
- **Mistake Shield** — قاعدة 13,000 startup فاشلة.
- **Founder-mode** (`/founder-mode`) — وضع التركيز.
- **First-100** (`/first-100`) — برنامج خاص لأوّل 100 شركة (lifetime deal).

## 8. مؤشّرات نجاح المنتج
- Activation: مستخدم جديد ينجز "أوّل خطّة عمل" خلال 24 ساعة.
- Retention: 40% Week-2 retention.
- Conversion: 8% Free → Paid.
- NPS: ≥ 40.

## 9. روابط مهمّة
- Marketing site: `app/page.tsx`
- Dashboard: `app/(dashboard)/`
- Investor pitch: `docs/INVESTOR_PITCH_DECK.html`
- Investor one-pager: `docs/INVESTOR_ONE_PAGER.md`
