
  
    
    

    create  table
      "dev"."marts"."fct_cost_daily__dbt_tmp"
  
    as (
      -- Daily cost rollup: one row per (date, agent, model). Powers Cost Dashboard.

select
    cost_date,
    agent_id,
    model,
    sum(input_tokens)        as input_tokens,
    sum(output_tokens)       as output_tokens,
    sum(cost_usd)            as cost_usd,
    count(*)                 as call_count,
    avg(cost_usd)            as avg_cost_per_call
from "dev"."staging"."stg_costs"
group by cost_date, agent_id, model
order by cost_date desc, cost_usd desc
    );
  
  