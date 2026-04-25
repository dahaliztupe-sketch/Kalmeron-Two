
  
  create view "dev"."staging"."stg_events__dbt_tmp" as (
    -- Staging: lifecycle events, typed timestamps, derived event_date.

select
    cast(event_id    as varchar)             as event_id,
    cast(user_id     as varchar)             as user_id,
    cast(event_type  as varchar)             as event_type,
    nullif(cast(agent_id as varchar), '')    as agent_id,
    cast(occurred_at as timestamp)           as occurred_at,
    cast(occurred_at as date)                as event_date,
    cast(session_id  as varchar)             as session_id
from "dev"."raw"."raw_events"
  );
