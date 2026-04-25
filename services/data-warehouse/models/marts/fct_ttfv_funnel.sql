-- TTFV funnel: per user, how long from signup → first question → first
-- value delivered? Aggregated by signup_date for cohort analysis.

with per_user as (
    select
        e.user_id,
        u.plan,
        u.country,
        u.signup_date,
        min(case when e.event_type = 'signup'                  then e.occurred_at end) as signed_up_at,
        min(case when e.event_type = 'first_question'          then e.occurred_at end) as asked_first_at,
        min(case when e.event_type = 'first_value_delivered'   then e.occurred_at end) as got_value_at,
        max(case when e.event_type = 'churned'                 then 1 else 0 end)      as churned
    from {{ ref('stg_events') }} e
    left join {{ ref('stg_users') }} u on u.user_id = e.user_id
    group by e.user_id, u.plan, u.country, u.signup_date
)

select
    user_id,
    plan,
    country,
    signup_date,
    signed_up_at,
    asked_first_at,
    got_value_at,
    churned,
    case when asked_first_at is not null and signed_up_at is not null
         then date_diff('second', signed_up_at, asked_first_at)
    end                                                            as seconds_to_first_question,
    case when got_value_at is not null and signed_up_at is not null
         then date_diff('second', signed_up_at, got_value_at)
    end                                                            as seconds_to_first_value,
    (got_value_at is not null)                                     as reached_value
from per_user
