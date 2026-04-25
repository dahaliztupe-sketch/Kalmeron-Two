
    
    

select
    cost_id as unique_field,
    count(*) as n_records

from "dev"."raw"."raw_costs"
where cost_id is not null
group by cost_id
having count(*) > 1


