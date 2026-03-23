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
        console.log(`Cache miss/expired for ${cacheKey}. Fetching from API...`);
        try {
            const response = await axios.get(`${BASE_URL}${endpoint}`, { headers });
            const data = response.data;

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

const getExercisesByTarget = (target) => 
    fetchWithCache(`/exercises/target/${target}`, `target_${target}`);

const getExercisesByEquipment = (equipment) => 
    fetchWithCache(`/exercises/equipment/${equipment}`, `equipment_${equipment}`);

const getExerciseById = (id) => 
    fetchWithCache(`/exercises/exercise/${id}`, `exercise_${id}`);

module.exports = {
    getTargetList,
    getBodyPartList,
    getEquipmentList,
    getExercisesByTarget,
    getExercisesByEquipment,
    getExerciseById
};
