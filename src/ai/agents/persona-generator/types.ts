export interface Persona {
  id: string;
  name: string;
  age: number;
  occupation: string;
  incomeLevel: 'low' | 'medium' | 'high';
  location: string;
  goals: string[];
  painPoints: string[];
  interests: string[];
  decisionFactors: string[];
}
