const exerciseDbService = require('./exerciseDbService');

const generateWorkout = async (profile, filters = {}) => {
    const { age, gender, weight, goal } = profile;
    const { equipment = [], bodyPart = [], targetMuscles = [] } = filters;

    // 1. Determine Parameters based on goal
    let sets = 3;
    let reps = "8-12";
    let rest_s = 90;

    if (goal === 'cut') {
        sets = 3;
        reps = "10-15";
        rest_s = 60;
    } else if (goal === 'bulk') {
        sets = 4;
        reps = "6-8";
        rest_s = 120;
    }

    // 2. Fetch Exercises
    let exercises = [];
    
    // Priority: targetMuscles > equipment > default targets
    if (targetMuscles && targetMuscles.length > 0) {
        const results = await Promise.all(targetMuscles.map(t => exerciseDbService.getExercisesByTarget(t)));
        exercises = results.flat();
    } else if (equipment && equipment.length > 0) {
        const results = await Promise.all(equipment.map(e => exerciseDbService.getExercisesByEquipment(e)));
        exercises = results.flat();
    } else {
        // Fallback to basic targets
        const defaultTargets = ['chest', 'lats', 'quads', 'delts'];
        const results = await Promise.all(defaultTargets.map(t => exerciseDbService.getExercisesByTarget(t)));
        exercises = results.flat();
    }

    if (!exercises || exercises.length === 0) return { title: `Custom ${goal || ''} Workout Plan`, exercises: [] };

    // 3. Post-fetch Filtering
    if (equipment && equipment.length > 0) {
        exercises = exercises.filter(ex => equipment.includes(ex.equipment));
    }
    if (bodyPart && bodyPart.length > 0) {
        exercises = exercises.filter(ex => bodyPart.includes(ex.bodyPart));
    }

    // 4. Grouping logic
    const buckets = {
        push: [], // chest, shoulders, triceps, pectorals, delts
        pull: [], // back, biceps, lats, traps, upper back
        legs: [], // quads, hamstrings, glutes, calves
        core: []  // abs, core
    };

    const pushTargets = ['chest', 'shoulders', 'triceps', 'pectorals', 'delts'];
    const pullTargets = ['back', 'biceps', 'lats', 'traps', 'upper back'];
    const legTargets = ['quads', 'hamstrings', 'glutes', 'calves', 'upper legs', 'lower legs'];
    const coreTargets = ['abs', 'core', 'waist'];

    exercises.forEach(ex => {
        const target = ex.target?.toLowerCase();
        const bp = ex.bodyPart?.toLowerCase();

        if (pushTargets.includes(target) || pushTargets.includes(bp)) buckets.push.push(ex);
        else if (pullTargets.includes(target) || pullTargets.includes(bp)) buckets.pull.push(ex);
        else if (legTargets.includes(target) || legTargets.includes(bp)) buckets.legs.push.push(ex);
        else if (coreTargets.includes(target) || coreTargets.includes(bp)) buckets.core.push.push(ex);
    });

    // 5. Selection (Pull 1 from each bucket, then pad to 6)
    const selection = [];
    
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    ['push', 'pull', 'legs', 'core'].forEach(b => {
        if (buckets[b].length > 0) {
            const shuffled = shuffle(buckets[b]);
            selection.push(shuffled[0]);
        }
    });

    // Padding to 6 exercises
    const remaining = exercises.filter(ex => !selection.find(s => s.id === ex.id));
    const shuffledRemaining = shuffle(remaining);
    
    while (selection.length < 6 && shuffledRemaining.length > 0) {
        selection.push(shuffledRemaining.shift());
    }

    // Final shuffle for display order
    const finalSelection = shuffle(selection);

    return {
        title: `Custom ${goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : ''} Workout Plan`,
        exercises: finalSelection.map(ex => ({
            id: ex.id,
            name: ex.name,
            sets: sets,
            reps: reps,
            rest_s: rest_s,
            instructions: ex.instructions || []
        }))
    };
};

module.exports = { generateWorkout };
