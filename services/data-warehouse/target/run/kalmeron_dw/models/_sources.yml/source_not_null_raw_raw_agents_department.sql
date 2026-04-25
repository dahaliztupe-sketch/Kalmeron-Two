
    select
      count(*) as failures,
      count(*) != 0 as should_warn,
      count(*) != 0 as should_error
    from (
      
    
  
    
    



select department
from "dev"."raw"."raw_agents"
where department is null



  
  
      
    ) dbt_internal_test