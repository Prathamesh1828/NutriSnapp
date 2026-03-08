import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeMealFromImage(base64Image: string, mimeType: string = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a professional nutritionist AI. Analyze this meal image and provide a detailed nutritional breakdown.

Return a JSON object with this exact structure:
{
  "food_name": "Name of the overall meal",
  "total_calories": number,
  "total_protein": number (grams),
  "total_carbs": number (grams),
  "total_fat": number (grams),
  "items": [
    {
      "name": "food item name",
      "calories": number,
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "portion_g": number (estimated),
      "confidence": number (0-1)
    }
  ],
  "suggestions": ["health tip 1", "health tip 2", "health tip 3"]
}

Be precise with nutritional values based on visible portion sizes. Return ONLY the JSON object.`;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response.text();

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse meal analysis response');

  return JSON.parse(jsonMatch[0]);
}

export async function generateWorkoutPlan(params: {
  goal: string;
  experience: string;
  daysPerWeek: number;
  equipment: string;
  age?: number;
  weight?: number;
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert personal trainer. Generate a detailed ${params.daysPerWeek}-day workout plan.

User profile:
- Goal: ${params.goal}
- Experience: ${params.experience}
- Equipment: ${params.equipment}
${params.age ? `- Age: ${params.age}` : ''}
${params.weight ? `- Weight: ${params.weight}kg` : ''}

Return a JSON object with this exact structure:
{
  "title": "Program title",
  "weeks": 4,
  "days": [
    {
      "day": 1,
      "title": "Day title (e.g., Upper Body Push)",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": number,
          "reps": "rep range (e.g., 8-12)",
          "rest_s": number (rest in seconds)
        }
      ]
    }
  ],
  "notes": "Important coaching notes and tips"
}

Return ONLY the JSON object.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse workout plan response');

  return JSON.parse(jsonMatch[0]);
}

export async function generateAICoachResponse(
  message: string,
  userContext: {
    goal?: string;
    weight?: number;
    calories?: number;
    protein?: number;
  }
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemContext = `You are NutriSnap AI Coach — a knowledgeable, motivating, and empathetic health & fitness coach.
  
User context:
- Goal: ${userContext.goal || 'Not specified'}
- Weight: ${userContext.weight ? `${userContext.weight}kg` : 'Not specified'}
- Daily calorie target: ${userContext.calories || 'Not specified'}
- Daily protein target: ${userContext.protein ? `${userContext.protein}g` : 'Not specified'}

Be conversational, specific, and actionable. Keep responses concise (2-4 paragraphs max).`;

  const result = await model.generateContent(`${systemContext}\n\nUser: ${message}`);
  return result.response.text();
}

export async function analyzePhysique(base64Image: string, goal: string, timeframe: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a professional fitness coach analyzing a physique photo.

Goal: ${goal}
Timeframe: ${timeframe}

Provide a constructive, encouraging analysis in JSON format:
{
  "assessment": "Brief overall assessment (2-3 sentences)",
  "strengths": ["strength 1", "strength 2"],
  "focus_areas": ["area 1", "area 2"],
  "recommendations": [
    {
      "category": "Training/Nutrition/Recovery",
      "tip": "Specific actionable advice"
    }
  ],
  "projected_progress": "What they can expect to achieve in the timeframe"
}

Be encouraging and professional. Return ONLY the JSON object.`;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: 'image/jpeg',
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response.text();

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse physique analysis response');

  return JSON.parse(jsonMatch[0]);
}
