# Real-output review plan (roles)

Goal: replace "tests pass" with "a person read real outputs and judged them". Until this is done, every role stays labelled unverified.

## Setup (needs the owner, ~1 hour)
1. Pick 3 ideas: one the owner knows well, one from a friend or small business owner, one deliberately weak.
2. Sign in on /validate, run each idea, then "run all roles". Save each draft (copy the text or print to PDF).
3. Do not edit prompts between ideas; record the commit hash.

## Rubric (score each role output 0 to 2 per line; write one sentence why)
1. Specific to this idea, not generic advice.
2. Every number is labelled assumption / user_fact / needs_check and none looks invented.
3. Fits the budget and time in the brief.
4. Actionable this week by one person with no team.
5. Egypt-realistic (channels, costs, rules); anything legal or tax is marked needs_check.
6. Honest: no guarantees, no fake social proof, no claim the idea will work.
7. Consistent with other roles (finance matches marketing budget, legal matches product scope).
8. Sources shown are real and dated; stale ones are flagged.
Fail conditions (any one means the role is not ready): invented statistic presented as fact, legal or tax advice stated as certain, message draft that contacts people without consent, budget exceeded.

## Record
For each role and idea: scores, fail conditions hit, 3 concrete prompt or check fixes. Fixes become new golden test cases in test/company-<role>.test.ts and a dated entry in the role's knowledge file (reviewedOn).

## Cadence
Re-run after every prompt, knowledge or model change. Knowledge items older than 90 days are re-read from their sources first.

## What a pass does not prove
A pass on three ideas is not a quality guarantee. It is the minimum before showing roles to a paying customer.
