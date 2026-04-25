# Architectural Decision Records (ADRs)

> "Architecture is the set of design decisions that, if made wrong, may cause your project to be cancelled."
> — Eoin Woods

## لماذا ADRs؟

كل قرار معماري نتّخذه (لماذا Firestore وليس MongoDB؟ لماذا Next.js وليس Remix؟) يُكتب هنا **مرّة واحدة**، ولا يُعاد فتحه إلّا إذا تغيّر سياق حقيقي. هذا يمنع:

- **Bikeshedding** عند كل مهندس جديد.
- **القرارات المنسيّة** اللي يكتشفها الفريق بعد سنة بـ "ليه عملنا كذا؟".
- **التراجع غير المُبرَّر** من وكلاء AI لا يعرفون السياق.

## النموذج

نتّبع نموذج [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) المُبسَّط:

```markdown
# NNNN — العنوان

**الحالة:** Proposed | Accepted | Deprecated | Superseded by NNNN
**التاريخ:** YYYY-MM-DD
**المقرِّرون:** أسماء أو أدوار

## السياق
ما الذي يجعل هذا القرار مطروحاً الآن؟

## القرار
ما الذي قرّرناه؟ (جملة أو جملتين)

## البدائل المُفحوصة
ما الخيارات التي رفضناها ولماذا؟

## النتائج
- Positive: ...
- Negative: ...
- Neutral: ...

## المراجع
روابط خارجيّة، PRs، تعليقات في الـ replit.md.
```

## كيفيّة إضافة ADR جديد

1. ابحث في هذا المجلّد عن أعلى رقم: `ls docs/decisions/ | sort -r | head -1`.
2. الرقم التالي = الموجود + 1، مكتوب بـ 4 أرقام (`0001`, `0002`, ...).
3. أنشئ `docs/decisions/NNNN-<title-kebab>.md`.
4. ابدأ بـ `Proposed`. بعد مراجعة الفريق، حوّل إلى `Accepted`.
5. **لا تحذف ADR.** لو القرار تغيّر، أضف ADR جديد بـ `Supersedes NNNN` وحوّل القديم إلى `Superseded by NNNN`.

## فهرس القرارات الحاليّة

| # | العنوان | الحالة | التاريخ |
|---|---|---|---|
| [0001](./0001-use-firestore-over-mongodb.md) | استخدام Firestore بدلاً من MongoDB | Accepted | 2026-04-25 |

## متى تكتب ADR؟

اكتب ADR لو القرار:

- **يصعب التراجع عنه** (تغيير DB، framework، payment provider).
- **يؤثّر على > 3 ملفّات/مكوّنات.**
- **يتعلّق بأمان أو خصوصيّة** (CSP، rules، PII handling).
- **يضيف dependency جديدة كبيرة** (مكتبة AI، runtime، قاعدة بيانات).
- **يغيّر deployment surface** (Edge → Node، Vercel → Cloud Run).

لا تكتب ADR لـ:

- Bug fixes.
- Refactoring داخل ملفّ واحد.
- تغييرات tweaks في UI.
- إضافة tests.
