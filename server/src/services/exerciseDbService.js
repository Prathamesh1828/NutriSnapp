const axios = require('axios');
const ExerciseCache = require('../models/ExerciseCache');

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

const headers = {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
};

const fetchWithCache = async (endpoint, cacheKey) => {
    try {
        // 1. Check Cache
        const cached = await ExerciseCache.findOne({ key: cacheKey });
        const now = new Date();
        const isFresh = cached && (now - cached.updatedAt) < (24 * 60 * 60 * 1000);

        if (isFresh) {
            console.log(`Cache hit for ${cacheKey}`);
            return cached.data;
        }

        // 2. Fetch from API
        console.log(`Cache miss/expired for ${cacheKey}. Fetching from API: ${BASE_URL}${endpoint}...`);
        try {
            // Split endpoint and query params manually for reliability
            const [path, queryString] = endpoint.split('?');
            const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};

            const response = await axios.get(`${BASE_URL}${path}`, { 
                headers, 
                params: { ...params, time: Date.now() } // Cache buster
            });
            const data = response.data;

            if (Array.isArray(data)) {
                console.log(`Successfully fetched ${data.length} records for ${cacheKey}`);
            }

            // Upsert into cache
            await ExerciseCache.findOneAndUpdate(
                { key: cacheKey },
                { data, updatedAt: now },
                { upsert: true, new: true }
            );

            return data;
        } catch (apiError) {
            console.error(`API Error for ${endpoint}:`, apiError.message);
            
            // 3. API Failed - Fallback to expired cache if exists
            if (cached) {
                console.warn(`Returning expired cache for ${cacheKey} due to API failure.`);
                return cached.data;
            }
            
            // 4. Ultimate Fallback
            return [];
        }
    } catch (err) {
        console.error(`fetchWithCache Error:`, err.message);
        return [];
    }
};

const getTargetList = () => fetchWithCache('/exercises/targetList', 'targetList');
const getBodyPartList = () => fetchWithCache('/exercises/bodyPartList', 'bodyPartList');
const getEquipmentList = () => fetchWithCache('/exercises/equipmentList', 'equipmentList');

const getExercises = async () => {
    try {
        const cacheKey = 'all_exercises_merged_v1';
        const cached = await ExerciseCache.findOne({ key: cacheKey });
        if (cached && (new Date() - cached.updatedAt) < (24 * 60 * 60 * 1000)) {
            return cached.data;
        }

        console.log(`[exerciseDbService] Merging exercises across body parts...`);
        const bodyParts = ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
        
        // Fetch many body parts in parallel
        const results = await Promise.all(bodyParts.map(bp => 
            fetchWithCache(`/exercises/bodyPart/${encodeURIComponent(bp)}?limit=100`, `bp_${bp}`)
        ));
        
        const all = results.flat();
        console.log(`[exerciseDbService] Merged ${all.length} exercises from ${bodyParts.length} categories.`);
        
        // Final cache of the merged list
        if (all.length > 0) {
            await ExerciseCache.findOneAndUpdate(
                { key: cacheKey },
                { data: all, updatedAt: new Date() },
                { upsert: true, new: true }
            );
        }
        
        console.log(`[exerciseDbService-v7] Successfully merged ${all.length} exercises.`);
        return all;
    } catch (err) {
        console.error('[exerciseDbService-v7] Merge fetch failed:', err);
        return [];
    }
};
const getExercisesOld = () => fetchWithCache('/exercises?limit=1300', 'all_exercises_full'); // Keep for safety but unused

const getExercisesByTarget = (target) => 
    fetchWithCache(`/exercises/target/${target}`, `target_${target}`);

const getExercisesByEquipment = (equipment) => 
    fetchWithCache(`/exercises/equipment/${equipment}`, `equipment_${equipment}`);

const getExercisesByBodyPart = async (bodyPart) => {
    const data = await fetchWithCache(`/exercises/bodyPart/${bodyPart}`, `bodyPart_${bodyPart}`);
    if (Array.isArray(data)) {
        console.log(`[exerciseDbService] Fetched ${data.length} exercises for bodyPart: ${bodyPart}`);
    }
    return data;
};

const getExerciseById = (id) => 
    fetchWithCache(`/exercises/exercise/${id}`, `exercise_${id}`);

module.exports = {
    getTargetList,
    getBodyPartList,
    getEquipmentList,
    getExercises,
    getExercisesByTarget,
    getExercisesByEquipment,
    getExercisesByBodyPart,
    getExerciseById
};
