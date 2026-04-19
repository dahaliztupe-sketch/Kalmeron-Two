from crewai import Agent, Task, Crew, Process

# وكيل الباحث
researcher = Agent(
    role='باحث سوق',
    goal='جمع وتحليل بيانات السوق المصري للفكرة المطروحة',
    backstory='خبير في أبحاث السوق المصرية مع 10 سنوات خبرة',
    tools=[] # market_research_tool
)

# وكيل المحلل المالي
financial_analyst = Agent(
    role='محلل مالي',
    goal='تقدير التكاليف والإيرادات المحتملة للفكرة',
    backstory='محلل مالي متخصص في تقييم المشاريع الناشئة',
    tools=[] # financial_modeling_tool
)

# وكيل قانوني
legal_advisor = Agent(
    role='مستشار قانوني',
    goal='تحديد المتطلبات القانونية والتنظيمية للفكرة',
    backstory='محامٍ متخصص في قانون الشركات الناشئة المصري',
)

# المهام
research_task = Task(description='تحليل حجم السوق والمنافسين', agent=researcher)
financial_task = Task(description='تقدير التكاليف ونقطة التعادل', agent=financial_analyst)
legal_task = Task(description='تحديد التراخيص المطلوبة', agent=legal_advisor)

# الطاقم
idea_crew = Crew(
    agents=[researcher, financial_analyst, legal_advisor],
    tasks=[research_task, financial_task, legal_task],
    process=Process.sequential  # تنفيذ متسلسل
)
