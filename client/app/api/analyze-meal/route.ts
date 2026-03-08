// FILE LOCATION: app/api/analyze-meal/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pipeline: base64 image → Groq Vision (llama-4-scout) → USDA FoodData Central
// ─────────────────────────────────────────────────────────────────────────────
// ENV VARS REQUIRED in .env.local:
//   GROQ_KEY=your_groq_api_key
//   USDA_KEY=your_usda_fooddata_key
//
// Get GROQ_KEY free at: https://console.groq.com → API Keys → Create
// Free tier: 30 requests/min, 500,000 tokens/day — no credit card needed
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

interface VisionResult {
  foodName: string;
  estimatedServingG: number;
  prepTimeMin: number;
  servings: number;
  confidence: string;
  ingredients: string[];
}

interface NutritionPer100g {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface AnalysisResult {
  foodName: string;
  servingGrams: number;
  servings: number;
  prepTimeMin: number;
  confidence: string;
  ingredients: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  per100g: NutritionPer100g;
}

// ── Step 1: Groq Vision ───────────────────────────────────────────────────────
async function identifyFoodWithGroq(
  base64Image: string,
  mimeType: string
): Promise<VisionResult> {
  const GROQ_KEY = process.env.GROQ_KEY;
  if (!GROQ_KEY) throw new Error("GROQ_KEY not set in .env.local");

  const prompt = `You are a food recognition expert. Analyze this food image carefully.
Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation.

Required JSON format:
{
  "foodName": "specific dish name (e.g. Grilled Chicken Breast, Chicken Biryani, Caesar Salad)",
  "estimatedServingG": <estimated weight of the portion shown in grams, number>,
  "prepTimeMin": <estimated prep+cook time in minutes, number>,
  "servings": <number of servings visible, number>,
  "confidence": "high" | "medium" | "low",
  "ingredients": ["main ingredient 1", "main ingredient 2", "...up to 5"]
}

Rules:
- foodName must be specific enough to find in a nutrition database
- If you see multiple dishes, pick the primary/largest one
- estimatedServingG should reflect what's visible (typical plate = 150-400g)
- If unsure, set confidence to "low" but still make your best guess`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as VisionResult;
  } catch {
    return {
      foodName: "Mixed Meal",
      estimatedServingG: 200,
      prepTimeMin: 20,
      servings: 1,
      confidence: "low",
      ingredients: [],
    };
  }
}

// ── Step 2: USDA FoodData Central ────────────────────────────────────────────
async function getNutritionFromUSDA(foodName: string): Promise<NutritionPer100g> {
  const USDA_KEY = process.env.USDA_KEY;
  if (!USDA_KEY) throw new Error("USDA_KEY not set in .env.local");

  const params = new URLSearchParams({
    api_key: USDA_KEY,
    query: foodName,
    pageSize: "1",
  });

  const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?${params}`);

  if (!response.ok) {
    throw new Error(`USDA API error ${response.status}`);
  }

  const data = await response.json();
  const food = data.foods?.[0];

  if (!food) {
    return { calories: 200, protein: 15, carbs: 25, fat: 8, fiber: 3, sugar: 5, sodium: 300 };
  }

  const getNutrient = (name: string): number => {
    const n = food.foodNutrients?.find(
      (fn: { nutrientName: string; value: number }) =>
        fn.nutrientName?.toLowerCase().includes(name.toLowerCase())
    );
    return Math.round(n?.value ?? 0);
  };

  return {
    calories: getNutrient("Energy"),
    protein:  getNutrient("Protein"),
    carbs:    getNutrient("Carbohydrate"),
    fat:      getNutrient("Total lipid"),
    fiber:    getNutrient("Fiber"),
    sugar:    getNutrient("Sugars"),
    sodium:   getNutrient("Sodium"),
  };
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType = "image/jpeg", servingGrams } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const visionResult = await identifyFoodWithGroq(image, mimeType);
    const per100g = await getNutritionFromUSDA(visionResult.foodName);

    const actualGrams = servingGrams ?? visionResult.estimatedServingG;
    const multiplier = actualGrams / 100;

    const result: AnalysisResult = {
      foodName:     visionResult.foodName,
      servingGrams: actualGrams,
      servings:     visionResult.servings,
      prepTimeMin:  visionResult.prepTimeMin,
      confidence:   visionResult.confidence,
      ingredients:  visionResult.ingredients,
      nutrition: {
        calories: Math.round(per100g.calories * multiplier),
        protein:  Math.round(per100g.protein  * multiplier),
        carbs:    Math.round(per100g.carbs    * multiplier),
        fat:      Math.round(per100g.fat      * multiplier),
        fiber:    Math.round(per100g.fiber    * multiplier),
        sugar:    Math.round(per100g.sugar    * multiplier),
        sodium:   Math.round(per100g.sodium   * multiplier),
      },
      per100g,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[analyze-meal]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}