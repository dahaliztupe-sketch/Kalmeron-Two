{# Override the default schema-prefixing behaviour so a custom +schema
   on a model/seed becomes the *literal* schema name, instead of being
   suffixed onto the target schema. This keeps mart names tidy
   (`marts.fct_cost_daily` vs `main_marts.fct_cost_daily`) and lines up
   the source declarations in `_sources.yml` with the seed locations. #}
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- set default_schema = target.schema -%}
    {%- if custom_schema_name is none -%}
        {{ default_schema }}
    {%- else -%}
        {{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}
