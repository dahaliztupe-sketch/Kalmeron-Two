
  
  create view "dev"."staging"."stg_users__dbt_tmp" as (
    -- Staging: typed user dimension.

select
    cast(user_id         as varchar)   as user_id,
    cast(signup_at       as timestamp) as signup_at,
    cast(signup_at       as date)      as signup_date,
    cast(plan            as varchar)   as plan,
    cast(country         as varchar)   as country,
    cast(referral_source as varchar)   as referral_source
from "dev"."raw"."raw_users"
  );
