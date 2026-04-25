
    select
      count(*) as failures,
      count(*) != 0 as should_warn,
      count(*) != 0 as should_error
    from (
      
    
  
    
    



select cost_id
from "dev"."raw"."raw_costs"
where cost_id is null



  
  
      
    ) dbt_internal_test