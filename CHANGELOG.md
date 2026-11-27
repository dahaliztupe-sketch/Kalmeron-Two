# Kalmeron — Changelog

All notable changes to the public-facing product. Internal-only refactors are
omitted unless they affect a user. The most recent release is at the top.

---

## [0.1.2](https://github.com/dahaliztupe-sketch/Kalmeron-Two/compare/v0.1.1...v0.1.2) (2026-11-27)


### Features

* **company:** 'how to check these drafts' panel in dashboard ([203d334](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/203d3344a74675987f7077ff51b48daa308b5f2f))
* **company:** Arabic labels in generic role viewer (local) ([cadd62d](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/cadd62df164166471004ee47665013cd96827e07))
* **company:** company brief, role spec + runner with quality checks, marketing role, /api/company/role (local only) ([09f348f](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/09f348f3acdd93d171fe1a864578637376909812))
* **company:** engineering, data, support, strategy roles ([b459a19](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b459a1994bf01d539c83329597b7cc5c15baf327))
* **company:** guest role runs capped before any demo (marketing only, flash model, global daily cap, fails closed) ([6a9b197](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/6a9b1979d5f76ff6ca7f7256c2a4c53f99a57c1e))
* **company:** intake form, gated dashboard, consolidated export download; docs ([213f094](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/213f0946786f2c78ea12d01d094b16a3784807f8))
* **company:** intake questions, stage gates, stale re-lock, consolidated export (logic + tests) ([a98774d](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/a98774d9f5df86884ac46b120e415a7215523ac1))
* **company:** orchestrator, company dashboard on /validate for all roles, finance registered; mark GAFI minimums item unverified (local) ([92e3779](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/92e3779839cca234e55b9e87d205396e39718ae4))
* **company:** per-user server-only workspace persistence (validated, size-capped), delete + export paths, rules + tests ([67fc52d](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/67fc52d9cbd04a12e7deb392ae6e31ee00b84944))
* **company:** role knowledge base with sources, review dates, stale flags (local) ([28ea847](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/28ea847428df28f2c1e5007d1d18c0cf85dbc1e1))
* **company:** role-to-role context (schema re-validated, data-only), legal registry/tax items (local) ([7ab5362](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/7ab536234470d860d50bfcb0d12cf2f2b29a70a0))
* **contact:** publish owner-confirmed contact email on contact/privacy/terms (local) ([e835093](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e835093578f4deb6676f3eaee7a62c88e52ba568))
* **egypt-calc:** show activation notice when tax-calc sidecar is unreachable ([505e260](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/505e26039a471cfb7ce81acf7363a4330b2c0fd3))
* **finance:** finance role, sourced knowledge, checks, tests (local) ([03f1042](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/03f1042367308b0153d365dee988def462404cc5))
* **finance:** finance role, sourced knowledge, checks, tests (local) ([882787a](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/882787ac90c3f7a5c0b280db5016bfcba400fbb7))
* **finance:** unit-economics, pricing and InstaPay knowledge, payment-fee and price checks, golden tests (local) ([371f324](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/371f324d66e3038bac184d9d623167c043fdf16b))
* **finance:** wallet knowledge (CBE mobile wallets, Vodafone Cash fee page), knowledge hygiene test (local) ([da1fdaa](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/da1fdaa6703bfc2eff8d832c333583781c734a1d))
* **firestore:** add 13 composite indexes found by query audit (not deployed) ([682ad84](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/682ad846c5e4733ab8b41477037141f610eb011c))
* **flags:** add useWorkersHealth hook for sidecar availability gating ([e7ce498](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e7ce49892f6bdd1741267b90cb154bc4d886694f))
* **ideas:** optional structured plan format with fallback + mocked tests; docs(readme): honest status (local only) ([3df660a](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/3df660ab6169fe7cd2c2bde2b08606639bcc86b6))
* **legal,ops:** Decree 816/2025 secondary items (direct marketing, sensitive data, erasure); golden tests (local) ([dbfb342](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/dbfb3426e4c3575e3a87b622a81fc30034f136e6))
* **legal:** assume founder may be a minor; lawyer questions, no conclusions ([ba90420](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ba90420ba2c32c6ff92ca82d0c0655b33ee0affb))
* **legal:** legal role, sourced knowledge, checks, tests (local) ([e881d3d](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e881d3d5208c959807745afa013d16c89b3ac704))
* **legal:** sourced commercial registry, VAT threshold and simplified tax items; registry/tax step checks (local) ([d322481](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/d32248117742727358f02957a8ea4e3faf30a478))
* **marketing:** Egypt Facebook reach knowledge item (secondary) (local) ([b2c4777](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b2c47776a4b394fb8d14ee2c2071e57d255a2243))
* **marketing:** sourced policy knowledge (WhatsApp opt-in, Meta ads, Egypt PDPL), bulk-outreach check (local) ([4c4b78e](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/4c4b78edcf25775fb1e5c75163ce6162087bc212))
* **ops:** ops role, sourced knowledge, checks, tests (local) ([bb55580](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/bb55580e9a7da5a8dce36f03bbd9ca5ce786dd3e))
* **ops:** sourced PDPL items for hiring data, sensitive-data check (local) ([ed0b6e4](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ed0b6e4d09dc06e82961f61a26017795681fb3a0))
* **plan:** guest daily cap + flash model for guests, feedback capture, owner delete/revoke (local only) ([876fc50](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/876fc509ed87fdd534703f59a8ad5543da020a93))
* **plan:** save + unlisted share link + print-to-PDF, /validate as main CTA and first nav item (local only) ([2aa102e](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/2aa102eb3dbb185c981fed712951a480d816ef9a))
* **product,ops:** sourced stack/cost items, cost tier check, social insurance item (local) ([2db0801](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/2db0801771fd8c8a6645f7441df62e2c052f4d6b))
* **product:** product role, sourced knowledge, checks, tests (local) ([5d9bc10](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/5d9bc102da4c22b1e12c69d4b0c1dbe20ce661df))
* **rag:** gate document upload behind sidecar availability (coming-soon notice when workers down) ([d807ea7](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/d807ea7c9a436f4b8bf80022288e3fa0eea58925))
* **sales:** sales role, sourced knowledge, checks, tests; docs/CONTRACT.md (local) ([b2f4a60](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b2f4a603c8b0cee6690eb08fa9ed381dd0096fce))
* **validate:** input hint and minimum length before analysis ([ac2f983](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ac2f983f782573c5d8b26755696c823ad9443c80))
* **validate:** marketing role UI (local only) ([1c3d88b](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/1c3d88bc766f043bba98daf706e879ffa5606391))
* **validate:** public /validate page rendering the structured plan (local only) ([88ddb61](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/88ddb61866c163b15a2b9e5b5248e7d1b31e78af))
* **validate:** signed-out marketing-role demo behind the guest cap ([0ce6aa8](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/0ce6aa8b16e6ab140bdda62f7b20b693fa89418b))


### Bug Fixes

* **a11y:** footer contrast and heading order, logo link name, add missing PWA icons, drop '57 assistants' claim from manifest ([21044fa](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/21044fa632c2631d06ce1f5f7830cbf324dacfe2))
* **a11y:** heading order, button names and touch targets, focus rings, live regions, logical RTL padding on /validate and the role dashboard ([e558991](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e55899177dcc0ae58c281e096e1e561e673944e7))
* **a11y:** raise muted text (zinc/neutral 500-600) to 400 on dark pages for AA contrast; Lighthouse color-contrast failed on /use-cases and /ai-experts ([6b5f056](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/6b5f05632ae076ce278a0e8540755dabf447fb94))
* **a11y:** use-cases cards use h2 under the page h1 (heading order) ([e7ca993](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e7ca9931a7673925220bb92df550f23ebfc6c69e))
* **ai:** append honesty rules to all 60 agent prompts (no persona bios, figures are unverified seeds) ([ce4a412](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ce4a412049cc7b8cdc5dfa4c1cf96467a51777b6))
* **auth:** preserve visitor intent through sign-in (next param end-to-end) ([#69](https://github.com/dahaliztupe-sketch/Kalmeron-Two/issues/69)) ([754d778](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/754d77847fd7783db51ad0ca118132a772c5b6cc))
* **blog:** remove unsourced statistics and invented price from blog posts ([23b389f](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/23b389fe4a0ffe61d1a5a0a640a81d7aac6e6e66))
* claim sweep + first-100 honesty + README accuracy ([e912550](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e91255015df79bdcb910fa2f586b2e0d6c2a6126))
* **company-roles:** name the matched word in overpromise issues; drop two more unverified claims (hundreds of founders, 24/7) ([2eb79f3](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/2eb79f33ba560610cb53c41e0a3e8e7f7e4d7ade))
* **company-roles:** show which word triggered overpromise; remove last unverified claims ([677eecf](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/677eecf1f7e0199cd31147eefcf2ebb5a670078c))
* **company/role:** allow 60 s runs and log the model-call failure cause ([1c54d61](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/1c54d6178ded6334ed8b341d277b716b2de70177))
* **contact:** remove unverified mailboxes; neutral contact page (local only) ([3c2b99b](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/3c2b99b0f9674feb17ab729b34f885a2be44ae85))
* **copy:** honest enterprise toast and first-100 badge (local only) ([1f5a726](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/1f5a726145f4a529891dde628a5e4a827d43dc85))
* **copy:** honest trust badge + drop 'كلميرون تو' repo-name leak across 61 files ([#72](https://github.com/dahaliztupe-sketch/Kalmeron-Two/issues/72)) ([b30fd8b](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b30fd8bc5af83a992181ce25c540b2f16ec0ad25))
* **copy:** remove GDPR/compliance-guarantee wording in microcopy, templates, expert pages ([3062628](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/30626287e95c8d5bd71e6111364ef761dcc9bdd3))
* current Live model id (env-overridable), no made-up live gateway URL; model-id literal guard and live route tests ([ba56c7e](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ba56c7e6bfcb63dfe61b8dff9b756f8e7a06d0e4))
* **dashboard:** correct assistant count in first-time tour (16 to 57) ([e80fd49](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e80fd49df62c565e1e116385d6f375ce7be0a5e4))
* **deps:** pin uuid override to ^11.1.1 (CJS) - uuid 14 is ESM-only and crashes firebase-admin at module load (all /api routes 500) ([8f77f4a](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/8f77f4acc542edeafc079ad770791bafabaff781))
* **gemini:** pin legacy @google/genai client to v1beta ahead of v3 default change ([6532e72](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/6532e7265dc81af2b0d8e5b2b95d856a3cca937e))
* honest copy + sidecar feature gating (P1 sweep) ([ba2f4c1](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ba2f4c16730eec4b0e0e25b24df84a2dfcf44073))
* **honesty:** /about had an invented team, advisors, spend statistic and 5% price claim ([294dc13](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/294dc135c39defd719a75597e89255274b8139d7))
* **honesty:** /compare drops unsourced cost/time tables, 97% claim, ROI calculator with fixed price; adds notice ([c667940](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/c6679401fd41192ab5235bdd9228a5b8b6dbca46))
* **honesty:** /pricing shows no invented prices or plans ([dd3680f](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/dd3680f7796611a4cce07c039eb9e7279b33c7f3))
* **honesty:** about page: remove invented team, advisor network, spend statistic, 5% price claim, 24/7 ([7fa9ec3](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/7fa9ec395db6e1e809cc3d9da6e804c501665daf))
* **honesty:** ai-experts page no longer claims trained experts ([9b76f84](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/9b76f844150e7a1a3d804dab2c8dc7f90477ef9c))
* **honesty:** compare table disclaimer; compact mobile cookie banner ([4551c37](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/4551c37ea91e82d26e5ed17a33c844ead684d5c8))
* **honesty:** fake social proof, landing comparison rows, first-100 claims ([ada2512](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ada2512499a0adba5358549ce121538d5f1dc578))
* **honesty:** landing chat card no longer claims accurate answers ([405217b](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/405217b5cc9d089bebd9777eeb239b33153b1a7b))
* **honesty:** landing comparison, fake social proof (hundreds of founders), first-100 claims ([a9ab791](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/a9ab79127a162a3026cd8a35e63e974259576291))
* **honesty:** MCP page described a product that does not exist; last 57-assistant claims ([aebb7a1](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/aebb7a1c981540e4b316344e09c1e0faa1be68a2))
* **honesty:** MCP server page was describing an unbuilt product; remaining 57-assistant claims removed ([f0b147d](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/f0b147da036bb17d717fdd321ec04b26d268b32d))
* **honesty:** pricing page shows no invented prices or plans; prices TBD, no payment exposed ([d8f822e](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/d8f822e5835732089d9081f6250367ff2737e1d0))
* **honesty:** remove invented counts (57/12 assistants), offers JSON-LD prices, USD savings claims, compliance claims from public copy ([cd8bd73](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/cd8bd730eef1b38bce3e74947022e7b0f27b519a))
* **honesty:** remove invented counts, prices and savings claims from public copy ([6013b2a](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/6013b2a0d3096225349c267c7f7cae3a325c3125))
* **honesty:** remove refund guarantee in pricing FAQ, SLA 99.9%, SOC 2 template claims, mistake-shield invented stats ([ed2c2c0](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ed2c2c0d7aeca7fc0c0483fb9d59e8580a168bcb))
* **honesty:** remove unbacked compliance/security/SLA/guarantee claims, fabricated industry stats and case studies; stale marker for downstream roles (local) ([051c35a](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/051c35a5c2497816194ec082f38ff74f64a31bf0))
* **honesty:** remove unconditional 30-day refund promise and fake '+1000 founders' claim; notice on success museum (local) ([e3cb516](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e3cb51684de222a1d6f8848d6fb57aa3adc5eba5))
* **honesty:** remove unsourced city facts/success stories/fake LocalBusiness schema, competitor tables, overpromising outcomes; blog and vs-chatgpt notices (local) ([1d95680](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/1d95680e902c8be9ded8d0760d97c0f89a2f3f26))
* **honesty:** soften unsourced stats in glossary and use-case promises (local) ([da1612a](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/da1612a4607a5110863303153a2716c4b730a0b4))
* **honesty:** unverified compare table disclaimer, drop exclusive/24-7 claims; compact cookie banner on mobile ([a8fa055](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/a8fa0556194c3e66040ff5fd99613fbe70066d97))
* **landing:** correct assistant count in AI Team section (16 to 57) ([bdad73f](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/bdad73f9203dc27673f83cf089d7e08b08beca48))
* **landing:** remove remaining unsupported claims in final CTA (user count, E2E badge) ([5c7dfca](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/5c7dfcad21a00615fc524beac0c1229592168545))
* **marketing:** remove unsupported claims - ar translations ([11c337a](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/11c337a461622fe401f9613db888011cc259d6c3))
* **marketing:** remove unsupported claims from landing and public pages ([99dfe2d](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/99dfe2d47e78e445ad5766d9da6110a94c22accc))
* **nav:** dead-route sweep — /start 404, billing portal links, settings tab deep-link ([#70](https://github.com/dahaliztupe-sketch/Kalmeron-Two/issues/70)) ([74e7da1](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/74e7da1a0d0fe0a2f684ee788b84fd8614c6811e))
* **pdf-worker:** Pillow 13.0.0 (12.3.0 has 62 OSV advisories); bump pypdf, python-multipart, pytest to OSV-clean latest ([906c5a8](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/906c5a8c5a3de911f0359487ae4122141639f851))
* **pricing:** correct assistant count in comparison table (16 to 57) ([ab4ed7b](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/ab4ed7bd8bf435c9459ff328ce71402f6034c1ee))
* **pricing:** drop E2E encryption badge, correct assistant count (16 to 57) and annual discount (20 to 33 pct) ([6cf1a63](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/6cf1a63c76fc2bcf008a8e1db01f46ee0b00794b))
* **pricing:** honest payments banner - gateways being activated, no auto-window promise ([09ecece](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/09ecece9ee3d77dff71d8b052a92cb2fc7906403))
* **pricing:** keep BillingCycle type export for unused billing components ([24e54f5](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/24e54f578bb82885cee8045a7c36405f06932fe4))
* **privacy:** working Admin-SDK data deletion; honest account-delete wording ([4bd1498](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/4bd14984cecb386dbd07ae8605916880d786d793))
* **routes:** revive /start and /demo by removing stale redirects ([#71](https://github.com/dahaliztupe-sketch/Kalmeron-Two/issues/71)) ([b0e939e](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b0e939ee63401919dccccde13e2664b3c87cdb3f))
* **security:** CodeQL property-injection in workspace-store; overrides for grpc-js, otel propagator-jaeger, form-data (npm audit prod: 0 high) ([669b7f3](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/669b7f39e39341315581a2adcb9464e251b5ff1f))
* **security:** egypt-calc proxy builds URL from fixed table; SSRF tests ([389af58](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/389af5826d54412654ebeaf2db7f9049050b882f))
* **seo:** drop invented Kalmeron prices from unrendered comparison data ([de8b7da](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/de8b7da2a447c72fc984dbf2cbbde5e32929bad3))
* **settings:** honest deletion toast ([c4eddc2](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/c4eddc2c65053e04105fedb62e506c090ac77eca))
* **site:** remove invented $499/month price, ROI comparison, 14-day trial and 24/7 claims from /crews ([dda2697](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/dda26971256c1218044c91933b37e09ee9b7d25e))
* **site:** remove lifetime $9 founders offer and seat counter; price is not set ([76625aa](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/76625aab3073f56d0ff0995fbbac6c855c2c690c))
* **site:** replace fabricated founder-network community page (5000+ founders) with not-available notice; drop invented market stat in investor guide ([77e4294](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/77e4294a19fe28c2ecd7be42bcaf4d60fdb4204b))
* **trust:** audit security claims against implementation ([d18a48c](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/d18a48c6419a44bb20e4a3de8cdcf0fac85b96b9))
* **trust:** audit security claims against implementation ([8868cdd](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/8868cdde464c0ee2a1d0d1afa138ab704cd781ef))
* **trust:** remove unverified domains/emails/socials, single SITE_URL, honest investors page (local only) ([82c3251](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/82c325170ea878a6fa1b47811ae3ea0942e005e4))
* **validate:** prefill idea via server searchParams (lint) ([b19c9d8](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b19c9d805027204bcbbaa3c791817b7febd0712c))


### Documentation

* company-in-a-box now 10 roles ([94bd20b](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/94bd20b3e5e3869220a907ad5dc2b7d2ca439f48))
* company-in-a-box status; marketing direct-marketing item now cites LegalIn translation of Reg. 816/2025 (local) ([d5daaba](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/d5daabacc2ee406f47382eadce8efc85c0a29e47))
* consolidation map (local) ([f66aac3](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/f66aac34e421ba1293354ce026038b425de41dc9))
* mark old claims historical; feat(plan): validated-plan schema, parser, renderer + tests (local only) ([fd4d103](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/fd4d103773d3af6ed803ab24a9429a4b154cd19d))
* real-output review rubric and first-founder pilot plan (drafts) ([9c6d303](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/9c6d303884304fcc8b1d871bd4e595c84559be82))
* redact key literal ([df09a07](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/df09a077e9d88231049370a4616e6ac23f5f846c))
* role output review checklist ([da26aae](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/da26aaefe3e42eff82290a9a791ce8bc5f820921))

## 0.1.1 (2026-05-14)


### Features

* **ai:** Phase 3 — AI agent quality improvements ([d8360fb](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/d8360fb76ed303b287c162abbf8851995f764b2a))
* **ai:** Phase 3 — AI agent quality improvements (complete) ([f7ee4a3](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/f7ee4a3cfca950baf8c48f052c6ae0ccc95c5d11))
* **billing:** Phase 4 — complete billing & payments pipeline ([0ac5ddb](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/0ac5ddb679053fe91e9cb7e4dad7fc2c8874239d))
* complete Zod validation at call sites + structured persona JSON for customer discovery ([5f3fc15](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/5f3fc15b3303753c3ee471a93255cac2de8f6ac5))
* create three critical Kalmeron operational skills ([3670a8e](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/3670a8e6becd6888e8c7580b3296617eba37a3f5))
* **digital-twin:** activate Neo4j Digital Twin — graph-builder, continuous-updater, graphrag ([c7252c4](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/c7252c4809cde8bc25b3e751b0820ce8f1d52714))
* GitHub repositories integration — OpenWolf + ECC + VoltAgent + SAST + Pro Workflow ([0beda2e](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/0beda2e793ff4e17cc409625467aff6b4cb3c787))
* **onboarding:** Onboarding UX Overhaul — First Mission Activation ([bdd05a2](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/bdd05a2d0482051efe8f6a51b720d528a992e793))
* **orchestrator:** connect 8 new specialist agents to intelligent conversation ([a3a0f35](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/a3a0f35f5d7eeb503cd7143f576bb566d7d91653))
* **pdf-worker:** Arabic complex document support — multi-column, tables, bidi, OCR fix ([8705489](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/87054893bddb328101055ffd622d6ff642f0aafb))
* **phase-3:** complete agent hardening and eval suite expansion ([156d1bc](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/156d1bc3e5849e05fdfcceeee53db3a10c0e1150))
* remove [@ts-nocheck](https://github.com/ts-nocheck) from orchestrator core and RAG layer (Task [#2](https://github.com/dahaliztupe-sketch/Kalmeron-Two/issues/2)) ([5963842](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/5963842b338d6f6ff28eacf79112825ea963e488))
* **workers:** add psutil memory reporting + CORS startup logging to all 4 workers ([9b26cef](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/9b26cef5afd2c990f3cabebb37ecf4a996ff9f1f))
* إعداد gnhf لتشغيل وكلاء Kalmeron ليلاً ([083c238](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/083c238142e5da0bbf7fc78d075684ff515c0d9f))


### Bug Fixes

* API stubs — Passkeys 410, Billing sales fallback, Temporal null-safe ([18138cf](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/18138cff7c428ffa6399d0684ee9678cf42443a2))
* approved-with-comments — pricing strategies, business plan template, security fixes ([fc61b26](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/fc61b26a87abc8908bcb01abffb7d6063ba036ea))
* **arch:** full architectural cleanup — RAG + multi-provider + cache + Neo4j + embeddings ([b9e8dd6](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b9e8dd6a4921ad9a590a4bf6749a706dfd3994d2))
* bring ESLint to 0 errors/warnings and clean up npm dependencies ([f4f6410](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/f4f64108fdc11af0467c2d4c0e2864806f8ffb5e))
* **dashboard+chat+brief+onboarding:** address all APPROVED_WITH_COMMENTS items ([6319cb7](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/6319cb7b191402a8be792838eea77bee79b07ded))
* **kalmeron-seeds:** add frontmatter, deepen 4 seeds, create parent SKILL.md ([7efa68b](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/7efa68b5ce83023d5cb3d930a5a36e8c83981d96))
* **phase-1a:** address all 5 code-review rejections + 2 approved-with-comments items ([f505274](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/f505274f1d57c4ceaf40c4a5e18beb021b2d09aa))
* properly type core lib files, orchestrator/panel — remove [@ts-nocheck](https://github.com/ts-nocheck) (Task [#1](https://github.com/dahaliztupe-sketch/Kalmeron-Two/issues/1)) ([155f2c9](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/155f2c9fa1f4cd2b16c458f2ec13d852ecffb7fa))
* resolve all 52 TypeScript errors, ESLint crash, mockup sandbox startup failure ([55c525c](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/55c525c250cc57b142fcb5078ef7de11e5c2b694))
* resolve all code-review blockers — TS clean, runway cron, agent memory write, Zod validation ([7a1a0e5](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/7a1a0e5b1c2610559d7f28ecb1fd4f682c72a359))
* resolve all ESLint lint-disable suppressions and TypeScript lib.dom.d.ts parse error ([e7fb6f5](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/e7fb6f5823ba69fcc1a3a3e922cc868c9e1ec2be))


### Documentation

* Wave 6 — complete all 69 agent system cards + update README ([b22e1a9](https://github.com/dahaliztupe-sketch/Kalmeron-Two/commit/b22e1a98cfa19f6fe4ae6cda97ab043f0575c67a))

## v2026.04.28-a — Hero Redesign + Brand Fix (2026-04-28)

A focused design pass on the most-trafficked surface — the marketing home —
plus a global brand-name correction.

### Changed

- **Landing hero (`app/page.tsx`)** rebuilt to a "Minimal Premium" layout
  (Variant A from the canvas exploration). Single chat-style input is now the
  central CTA; suggestion chips sit immediately below it; trust badges move
  from above the input to a muted grayscale row at the bottom. Headline scale
  increased (`clamp(2rem, 1rem + 6vw, 5.5rem)`) and the floating brand mark
  above the headline is removed — the brand identity now lives only in the
  top nav, giving the headline full focus. Background luminous gradient
  blobs replace the prior radial-gradient washes. Particle field, scroll
  hint, and all `Landing.*` i18n keys (282 across ar/en) preserved.
- **Brand spelling fix** across 6 user-facing strings. Corrected
  `كالميرون` → `كلميرون` (canonical per `src/lib/copy/lexicon.ts:26`)
  in: `app/trust/page.tsx` (3 places — title, meta description, intro
  paragraph), `app/status/page.tsx` (status page H1),
  `app/(dashboard)/ideas/analyze/page.tsx` (idea-analyzer hint copy),
  `app/api/chat/route.ts` (user-visible error message), and
  `src/ai/agents/cfo-agent/prompt.ts` (CFO agent system prompt identity).

### Verified

- `npm run lint:lexicon` → PASS (0 forbidden aliases).
- `npx tsc --noEmit` on main app → 0 errors (sandbox `artifacts/`
  pre-existing issues unchanged).
- `npm run lint` on main app → clean (only pre-existing sandbox warnings).
- Live screenshot of `/` confirms the new hero renders correctly with
  Eastern Arabic numerals, gradient title line 2, and the chat-style CTA.

---

## v2026.04.24-e — CI Green (2026-04-24)

Fixes the failing GitHub Actions runs visible on the `Actions` tab.

### Fixed

- **AI Code Review workflow** (`.github/workflows/ai-code-review.yml`).
  Replaced the non-existent `coderabbitai/ai-pr-reviewer@v2` action — which
  caused every PR (including all Dependabot bumps) to fail the workflow —
  with a deterministic three-step gate: install, ESLint, lexicon lint.
- **Security audit** (`.github/workflows/security.yml` + new
  `scripts/check-audit.mjs`). The previous `npm audit --audit-level=high`
  failed on two `xlsx` advisories with no upstream fix
  (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9). New audit checker writes the
  JSON report and explicitly allowlists those IDs while still blocking on
  any *new* high/critical advisory. Easy to extend (add a GHSA ID to
  `ALLOWLIST` with a one-line justification).
- **`undici` high-severity advisories** (6 of them, transitively pulled in
  by `mem0ai → @qdrant/js-client-rest@1.13.0`). Added an `overrides` block
  in `package.json` to pin `@qdrant/js-client-rest` to `1.17.0` and `undici`
  to `^6.23.0`, eliminating all 6 advisories from the production tree.
- **Lexicon strict** (`scripts/lexicon-lint.ts`). Added two intentional
  surfaces to the allowlist: `app/en/page.tsx` (English locale landing —
  English brand terms are correct here) and `app/crews/finance/page.tsx`
  (the Finance Crew product page uses "CFO Agent" as a deliberate SKU
  name). Added a `lexicon-allow` comment in `app/api/daily-brief/route.ts`
  for the stub email template where "وحدة" means "unit (of product)",
  not the lexicon "department" sense.

---

## v2026.04.24-d — Closing the Roadmap (2026-04-24)

A second push in the same day to land the items previously tagged
"separate engineering project". They are still scoped — RAG isn't a full
graph DB, workflows aren't Temporal-backed — but every promise in the
README is now a real artefact users can touch.

### Added

- **`<AgentBlock>` is wired into chat** (`components/chat/AssistantContent.tsx`).
  The chat surface now detects when an assistant message is structured —
  either pure JSON `{"blocks":[…]}` or a fenced ` ```json ` block inside
  prose — and renders it through `<AgentBlockStream>`. Plain-text and
  Markdown paths are unchanged. Any agent that opts into the format gets
  charts, forms, checklists, and timelines for free.
- **Workflow runner** (`src/lib/workflows/runner.ts` + `library.ts`).
  Tiny dependency-free engine: a JSON spec declares 2-10 sequential
  steps, each step picks an agent and a templated prompt with
  `{{input.x}}` / `{{steps.id.text}}` interpolation. Real Gemini call
  when an API key is present, deterministic stub otherwise. Five seed
  workflows ship: `idea-to-mvp`, `fundraise-readiness`,
  `weekly-investor-update`, `compliance-egypt`, `saas-pricing`.
- **Workflow API** — `POST /api/workflows/run` with PII-redacted inputs
  and per-step timing; `GET /api/workflows/list` for enumeration.
- **Interactive runner UI** — `/workflows-runner` (dashboard-shell
  page): pick a workflow, fill the inputs, watch each step's output
  stream in. The `/workflows` SEO landing keeps its marketing role.
- **PWA hardening** — `public/manifest.json` gains `lang: "ar"`,
  `dir: "rtl"`, `scope`, three `shortcuts` (Chat / Daily-Brief /
  Dashboard), and `display_override`. `public/sw.js` bumps to v2 and
  pre-caches a dedicated `/offline` page used as the navigation
  fallback when the user is fully offline.
- **`/offline` page** (`app/offline/page.tsx`) — Arabic, RTL, retry
  button, marked `noindex` so it never enters search results.
- **Multi-tenant isolation audit** —
  `docs/MULTI_TENANT_ISOLATION.md` (canonical reference). Documents
  the per-user / per-workspace modes, the five defence-in-depth layers,
  the per-collection ownership matrix, the developer guarantees for
  new collections, and the negative tests that must keep failing.

---

## v2026.04.24-c — Generative-UI Wave (2026-04-24)

A second-pass execution sprint that lands every remaining audit recommendation
that does not require a separate infrastructure project (RAG, multi-tenant,
mobile-offline). Together with v2026.04.24, this closes out 100 % of the
DESIGN_AUDIT_2026 P0/P1 backlog and the Roadmap Phase 4-5 items.

### Added

- **`<AgentBlock>` extended from 5 → 9 variants** (`components/agent/AgentBlock.tsx`).
  The Wave-3 primitive (`stat / list / table / callout / milestone`) now also
  renders four agentic-UI block types from JSON returned by agents:
  `chart` (area / bar via the Kalmeron chart kit), `form` (interactive — emits
  values via `onFormSubmit`), `checklist` (interactive local toggle state),
  and `timeline` (vertical event log with toned dots). Same shape-guard
  approach (no zod dep) — invalid blocks render an "unknown block" placeholder
  instead of crashing the surrounding stream. This is the audit's
  highest-value follow-up to the original Wave-3 primitive (push from KPIs
  toward fully agentic UI).
- **Real Daily Brief generation** — `app/api/daily-brief/route.ts` now calls
  the medium-tier router model (Gemini 2.5 Flash) with a strict zod schema, a
  workspace-signal context, and a deterministic stub fallback. Response is
  cached `private, max-age=21600`. The CHANGELOG note that this would "land
  in v2026.05" — landed early.
- **PII redactor (Arabic-aware)** — `src/lib/security/pii-redactor.ts`.
  Detects 10 PII categories tuned for the MENA audience: Egyptian + Saudi +
  international phone numbers, Egyptian + Saudi national IDs, IBAN, credit
  card, email, Arabic addresses ("شارع …"), and IPv4. Returns a redacted
  string and an audit trail (no raw values stored). Wired into the daily-brief
  pipeline; ready to plug into the chat ingress next.
- **Skip-to-content link** in `AppShell` — visible on focus only, jumps to
  `#kalmeron-main`. Clears the WCAG 2.4.1 (Bypass Blocks) requirement that
  was the last open a11y P1 item.
- **Golden dataset expansion** — `test/eval/golden-dataset.json` grew from
  108 to **130 cases**: nine new router cases (B2B SaaS, Family Office,
  marketplace), three Gulf-flavored PII cases (IBAN, intl phone, Saudi ID),
  three quality rubrics (pricing strategy, risk register, root-cause), three
  new safety probes (spam bot, tax fraud, system-prompt extraction).

### Changed

- **CHANGELOG / STRATEGIC_MASTER_PLAN** updated. Master plan gains §18
  ("Wave 6 — Generative-UI & Eval Hardening") summarizing the new surface
  area and the closed audit lines.

### Notes

- Phases 6-9 of `docs/NEXT_DEVELOPMENT_ROADMAP.md` (real RAG over user data,
  workflow automation, multi-tenant team mode, mobile + offline) are scoped as
  separate engineering projects and remain on the roadmap.

---

## v2026.04.24 — 45-Expert Audit · P0/P1 Wave (2026-04-24)

A focused execution sprint addressing every Priority-0 and Priority-1
recommendation from `docs/BUSINESS_EXPERT_PANEL_45_REPORT.md`.

### Added

- **Multi-provider LLM gateway with hedged fallback** — Anthropic and OpenAI
  adapters slot into the same router as Gemini. Failover walks the chain
  defined by `KALMERON_PROVIDER_ORDER`. Plan documented in
  `docs/HEDGING_PLAN.md`.
- **Two-layer prompt cache** — in-memory LRU + Firestore-backed L2, capped TTL,
  hashed key. Sits in front of the router for repeated prompts.
- **Time-to-First-Value (TTFV) instrumentation** — per-user cold/warm metrics
  in `src/lib/analytics/ttfv.ts`, daily rollup, and admin tile
  (`components/admin/TtfvWidget.tsx`).
- **ROI calculator** — interactive component on `/`, `/compare`, and
  standalone at `/roi`. Localized to Egyptian pound + dialect.
- **Trust badges** in the global footer and on `/compare`: Egyptian Law 151,
  Saudi PDPL, GDPR, TLS 1.3 / AES-256.
- **First-100 Lifetime Deal page** at `/first-100` — counter, benefits, FAQ,
  CTA. Pre-launch traction lever.
- **Affiliate program landing** at `/affiliate` — 30 % commission, 12 months
  recurring, three partner tiers.
- **Public changelog** at `/changelog` (you're reading it).
- **Operational Mirror "Daily Brief"** at `/dashboard/daily-brief` plus the
  feeding API at `/api/daily-brief`. One anomaly + one decision + one ready-
  to-send message every morning.
- **English landing page** at `/en` with proper Hreflang and a backlink to AR.
- **Sitemap** updated to include all new routes.

### Documentation

- `docs/HEDGING_PLAN.md` — operational playbook for provider switchovers.
- `docs/PIA_TEMPLATE.md` — Privacy Impact Assessment template (mandatory before
  any new agent or integration).
- `docs/PITCH_DECK.md` — 12-slide pre-seed deck script.
- `docs/FOUNDERS_LETTER_TEMPLATE.md` — monthly founder's letter template.
- `docs/FUNNEL_ANALYTICS.md` — refreshed with TTFV taxonomy.

### Quality

- Golden dataset expanded from **51 to 80 cases**, including new safety / prompt-
  injection probes (`safety-001`, `safety-002`) and three additional quality
  rubric cases.

### Notes

- No breaking changes to the public API.
- Provider fallback is a no-op until `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` is
  set — Gemini remains the default everywhere.
- Daily Brief currently returns a deterministic stub; LangGraph-powered
  generation lands in v2026.05.

---

## v2026.04 — Wave-5 Foundation (2026-04-15)

- 16 production agents across 7 departments.
- Governance: cost ledger, consent ledger, audit logs, RBAC.
- Lexicon CI lint enforcing Egyptian Arabic voice across the codebase.
- Right-to-erasure with end-to-end deletion test.

(Earlier history available in `docs/EXPERT_PANEL_AUDIT_REPORT.md`.)
