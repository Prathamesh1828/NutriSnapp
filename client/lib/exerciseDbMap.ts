// lib/exerciseDbMap.ts
// Fetches ExerciseDB exercises and creates a name-based lookup map
// so we can match wger exercises to ExerciseDB GIF images by name

export interface ExerciseDBItem {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  bodyPart: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
}

let cache: ExerciseDBItem[] | null = null;

// Normalize a name for fuzzy matching
// e.g. "Cable Rear Delt Fly" → "cable rear delt fly"
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')   // remove special chars
    .replace(/\s+/g, ' ')          // collapse spaces
    .trim();
}

// Fetch all exercises from ExerciseDB (via our proxy) with caching
export async function fetchAllExerciseDB(): Promise<ExerciseDBItem[]> {
  if (cache) return cache;

  const res = await fetch(
    `/api/exercisedb?path=${encodeURIComponent('/exercises?limit=1300&offset=0')}`
  );

  if (!res.ok) throw new Error(`ExerciseDB fetch failed: ${res.status}`);

  const data: ExerciseDBItem[] = await res.json();
  cache = data;
  return data;
}

// Build a map: normalizedName → ExerciseDBItem
export function buildNameMap(items: ExerciseDBItem[]): Map<string, ExerciseDBItem> {
  const map = new Map<string, ExerciseDBItem>();
  for (const item of items) {
    map.set(normalizeName(item.name), item);
  }
  return map;
}

// Find best match for a wger exercise name in ExerciseDB
export function findMatch(
  wgerName: string,
  nameMap: Map<string, ExerciseDBItem>
): ExerciseDBItem | null {
  const normalized = normalizeName(wgerName);

  // 1. Exact match
  if (nameMap.has(normalized)) return nameMap.get(normalized)!;

  // 2. Partial match — wger name contains exercisedb name or vice versa
  for (const [key, item] of nameMap.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return item;
    }
  }

  // 3. Word overlap match — share at least 2 significant words
  const wgerWords = normalized.split(' ').filter(w => w.length > 3);
  for (const [key, item] of nameMap.entries()) {
    const keyWords = key.split(' ').filter(w => w.length > 3);
    const overlap = wgerWords.filter(w => keyWords.includes(w));
    if (overlap.length >= 2) return item;
  }

  return null;
}