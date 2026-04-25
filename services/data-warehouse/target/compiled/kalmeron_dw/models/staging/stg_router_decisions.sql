-- Staging: router decisions with `is_correct` flag derived once here so
-- every downstream mart agrees on the definition.

select
    cast(decision_id      as varchar)   as decision_id,
    cast(occurred_at      as timestamp) as occurred_at,
    cast(occurred_at      as date)      as decision_date,
    cast(user_id          as varchar)   as user_id,
    cast(question_excerpt as varchar)   as question_excerpt,
    cast(expected_agent   as varchar)   as expected_agent,
    cast(routed_agent     as varchar)   as routed_agent,
    cast(confidence       as double)    as confidence,
    cast(latency_ms       as integer)   as latency_ms,
    (expected_agent = routed_agent)     as is_correct
from "dev"."raw"."raw_router_decisions"