
  
    
    

    create  table
      "dev"."marts"."fct_router_accuracy__dbt_tmp"
  
    as (
      -- Per-agent routing accuracy (precision-style: of the times this agent
-- was *expected*, how often was it actually routed?). Powers the Eval
-- Dashboard and feeds back into router-prompt iteration.

with by_expected as (
    select
        expected_agent                                  as agent_id,
        count(*)                                        as expected_count,
        count(*) filter (where is_correct)              as correct_count,
        avg(confidence)                                 as avg_confidence,
        avg(latency_ms)                                 as avg_latency_ms,
        percentile_cont(0.95) within group (order by latency_ms) as p95_latency_ms
    from "dev"."staging"."stg_router_decisions"
    group by expected_agent
)

select
    b.agent_id,
    a.agent_name,
    a.department,
    b.expected_count,
    b.correct_count,
    b.expected_count - b.correct_count          as missed_count,
    case when b.expected_count = 0 then 0
         else b.correct_count::double / b.expected_count
    end                                          as accuracy,
    b.avg_confidence,
    b.avg_latency_ms,
    b.p95_latency_ms
from by_expected b
left join "dev"."staging"."stg_agents" a on a.agent_id = b.agent_id
order by accuracy asc, expected_count desc
    );
  
  