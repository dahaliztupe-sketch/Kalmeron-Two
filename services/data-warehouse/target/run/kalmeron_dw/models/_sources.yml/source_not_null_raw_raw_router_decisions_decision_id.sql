
    select
      count(*) as failures,
      count(*) != 0 as should_warn,
      count(*) != 0 as should_error
    from (
      
    
  
    
    



select decision_id
from "dev"."raw"."raw_router_decisions"
where decision_id is null



  
  
      
    ) dbt_internal_test