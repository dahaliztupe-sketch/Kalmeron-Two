-- Agent dimension enriched with cost & usage rollups.
-- One row per agent. Joined into other marts for cheap lookups.

with agents as (
    select * from {{ ref('stg_agents') }}
),
costs as (
    select
        agent_id,
        sum(cost_usd)                           as total_cost_usd,
        count(*)                                as total_calls,
        sum(input_tokens + output_tokens)       as total_tokens
    from {{ ref('stg_costs') }}
    group by agent_id
),
events as (
    select
        agent_id,
        count(*) filter (where event_type = 'first_value_delivered') as first_values_delivered
    from {{ ref('stg_events') }}
    where agent_id is not null
    group by agent_id
)

select
    a.agent_id,
    a.agent_name,
    a.department,
    a.launched_on,
    coalesce(c.total_cost_usd, 0)             as total_cost_usd,
    coalesce(c.total_calls, 0)                as total_calls,
    coalesce(c.total_tokens, 0)               as total_tokens,
    coalesce(e.first_values_delivered, 0)     as first_values_delivered,
    case
        when coalesce(c.total_calls, 0) = 0 then 0
        else coalesce(c.total_cost_usd, 0) / c.total_calls
    end                                       as avg_cost_per_call_usd
from agents a
left join costs  c on c.agent_id = a.agent_id
left join events e on e.agent_id = a.agent_id
