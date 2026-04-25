
  
  create view "dev"."staging"."stg_costs__dbt_tmp" as (
    -- Staging: typed cost ledger.

select
    cast(cost_id        as varchar)   as cost_id,
    cast(occurred_at    as timestamp) as occurred_at,
    cast(occurred_at    as date)      as cost_date,
    cast(agent_id       as varchar)   as agent_id,
    cast(user_id        as varchar)   as user_id,
    cast(model          as varchar)   as model,
    cast(input_tokens   as integer)   as input_tokens,
    cast(output_tokens  as integer)   as output_tokens,
    cast(cost_usd       as double)    as cost_usd
from "dev"."raw"."raw_costs"
  );
