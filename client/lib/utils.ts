import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInM = height / 100;
  return Math.round((weight / (heightInM * heightInM)) * 10) / 10;
}

export function getBMICategory(bmi: number): {
  label: string;
  color: string;
} {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' };
  if (bmi < 25) return { label: 'Normal weight', color: '#B8FF3C' };
  if (bmi < 30) return { label: 'Overweight', color: '#f97316' };
  return { label: 'Obese', color: '#ef4444' };
}

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string
): number {
  // Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
}

export function calculateMacroTargets(
  calories: number,
  goal: string
): { protein: number; carbs: number; fat: number } {
  let proteinRatio: number;
  let carbRatio: number;
  let fatRatio: number;

  switch (goal) {
    case 'cut':
      proteinRatio = 0.35;
      carbRatio = 0.35;
      fatRatio = 0.30;
      break;
    case 'bulk':
      proteinRatio = 0.25;
      carbRatio = 0.50;
      fatRatio = 0.25;
      break;
    default: // maintain
      proteinRatio = 0.30;
      carbRatio = 0.40;
      fatRatio = 0.30;
  }

  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
  };
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
