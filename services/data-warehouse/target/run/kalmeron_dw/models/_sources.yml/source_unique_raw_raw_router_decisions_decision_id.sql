
    select
      count(*) as failures,
      count(*) != 0 as should_warn,
      count(*) != 0 as should_error
    from (
      
    
  
    
    

select
    decision_id as unique_field,
    count(*) as n_records

from "dev"."raw"."raw_router_decisions"
where decision_id is not null
group by decision_id
having count(*) > 1



  
  
      
    ) dbt_internal_test