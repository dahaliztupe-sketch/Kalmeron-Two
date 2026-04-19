export const generateNDA = (disclosingParty: string, receivingParty: string, purpose: string, duration: string) => {
  return `# اتفاقية عدم إفصاح (NDA)
  
  **الطرف الأول (المفصح):** ${disclosingParty}
  **الطرف الثاني (المتلقي):** ${receivingParty}
  **الغرض:** ${purpose}
  **المدة:** ${duration}

  تلتزم الأطراف بالحفاظ على سرية المعلومات المتبادلة وعدم إفشائها.
  
  *تنويه: هذا النموذج للاسترشاد فقط. يرجى مراجعة محامٍ مختص.*`;
};

export const generateFoundersAgreement = (founders: string[], companyName: string, equitySplit: string, roles: string) => {
  return `# اتفاقية مؤسسين (${companyName})
  
  هذه الاتفاقية تنظم العلاقة بين المؤسسين: ${founders.join(', ')}.
  **توزيع الحصص:** ${equitySplit} 
  **الأدوار:** ${roles}
  
  *تنويه: هذا النموذج للاسترشاد فقط. يُنصح بشدة بالحصول على استشارة قانونية.*`;
};

export const generateEmploymentContract = (employeeName: string, position: string, salary: string, startDate: string) => {
  return `# عقد عمل بسيط
  
  **الموظف:** ${employeeName}
  **المسمى الوظيفي:** ${position}
  **الراتب:** ${salary}
  **تاريخ البدء:** ${startDate}
  
  *تنويه: هذا النموذج للاسترشاد فقط. يخضع لقانون العمل المصري.*`;
};
