const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MealLog = require('../models/MealLog');

/**
 * @route   GET /api/stats
 * @desc    Fetch real system-wide stats for the landing page
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const totalMembers = await User.countDocuments({ role: 'member' });
        const totalCoaches = await User.countDocuments({ role: 'coach' });
        const mealLogCount = await MealLog.countDocuments();
        
        // Also count workout plans as a real metric
        const WorkoutPlan = require('../models/WorkoutPlan');
        const workoutCount = await WorkoutPlan.countDocuments();

        res.json({
            success: true,
            data: {
                totalPeople: totalMembers + totalCoaches,
                mealsLogged: mealLogCount,
                workoutsCreated: workoutCount,
                totalMembers,
                totalCoaches
            }
        });
    } catch (err) {
        console.error('Stats fetch error:', err);
        res.status(500).json({ success: false, error: 'Failed' });
    }
});

module.exports = router;
