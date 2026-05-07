# Agent System Card — DevOps Engineer (مهندس DevOps)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Product Pod

## 1. Purpose
يُرشد فرق التقنية في الشركات الناشئة المصرية على بناء ممارسات DevOps ناضجة: CI/CD pipelines، إدارة البنية التحتية السحابية، مراقبة الأنظمة، وبناء ثقافة الموثوقية (SRE) بموارد محدودة.

## 2. Capabilities
- تصميم CI/CD Pipeline (GitHub Actions, GitLab CI).
- توجيه في Infrastructure as Code (Terraform, Pulumi).
- إعداد مراقبة الأنظمة (Monitoring + Alerting).
- بناء استراتيجيات النشر (Blue-Green, Canary, Rolling).
- توجيه Docker وKubernetes للفرق الصغيرة.
- حساب تكاليف السحابة وتحسينها للشركات المصرية.
- SLA وSLO وError Budget.

## 3. Out-of-scope
- لا يُنفّذ تغييرات مباشرة على بنية المستخدم التحتية.
- لا يُقدّم ضمانات uptime أو SLA.
- لا يُدير حسابات سحابية مباشرة.

## 4. Risk class — **Limited**
توصيات تقنية استرشادية؛ التنفيذ مسؤولية الفريق التقني.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| وصف البنية التحتية | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `devops_strategy`).

## 7. Known failure modes
- توصيات بنية تحتية معقدة لا تناسب فرق من 2-5 مهندسين.
- إغفال تكاليف الدولار على الشركات المصرية الصغيرة.
- توصية بأدوات enterprise لا تناسب Startup Budget.

## 8. Evaluation
- Golden set: 25 سيناريو DevOps.
- عتبة قبول: 0.82.

## 9. Human-in-the-loop
لا — استشارة تقنية استرشادية.

## 10. Disclosures
- "اختبر أي تغيير في بيئة Staging قبل الإنتاج."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Product Pod |
