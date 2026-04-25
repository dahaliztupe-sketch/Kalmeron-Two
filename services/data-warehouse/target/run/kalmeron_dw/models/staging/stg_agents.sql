
  
  create view "dev"."staging"."stg_agents__dbt_tmp" as (
    -- Staging: clean raw_agents → typed columns + display name.

select
    cast(agent_id      as varchar) as agent_id,
    cast(agent_name    as varchar) as agent_name,
    cast(department    as varchar) as department,
    cast(launched_on   as date)    as launched_on
from "dev"."raw"."raw_agents"
  );
