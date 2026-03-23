const express = require('express');
const WorkoutPlan = require('../models/WorkoutPlan');
const workoutGenerator = require('../services/workoutGenerator');

const router = express.Router();

// Generate a workout plan
router.post('/generate', async (req, res) => {
    try {
        const { age, gender, weight, goal, equipment, bodyPart, targetMuscles } = req.body;
        
        // Basic validation (optional, can be stricter)
        const profile = { age, gender, weight, goal };
        const filters = { equipment, bodyPart, targetMuscles };

        const plan = await workoutGenerator.generateWorkout(profile, filters);
        res.json({ success: true, data: plan });
    } catch (err) {
        console.error('Generation Error:', err);
        res.status(500).json({ success: false, error: 'Failed to generate workout plan' });
    }
});

// Save a workout plan
router.post('/', async (req, res) => {
    try {
        const { userId, title, exercises, weeks, notes } = req.body;
        
        if (!userId || !title || !exercises) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const newPlan = await WorkoutPlan.create({
            userId,
            title,
            exercises,
            weeks,
            notes
        });

        res.status(201).json({ success: true, data: newPlan });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to save plan' });
    }
});

// List all plans for a user
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, error: 'User ID is required' });

        const plans = await WorkoutPlan.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: plans });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch plans' });
    }
});

// Get active plan
router.get('/active', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, error: 'User ID is required' });

        const plan = await WorkoutPlan.findOne({ userId, is_active: true });
        res.json({ success: true, data: plan });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch active plan' });
    }
});

// Update plan fields
router.put('/:id', async (req, res) => {
    try {
        const updatedPlan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: updatedPlan });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update plan' });
    }
});

// Set a plan as active
router.put('/:id/activate', async (req, res) => {
    try {
        const plan = await WorkoutPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

        // Deactivate all other plans for this user
        await WorkoutPlan.updateMany({ userId: plan.userId }, { is_active: false });

        // Activate this plan
        plan.is_active = true;
        await plan.save();

        res.json({ success: true, message: 'Plan activated' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to activate plan' });
    }
});

// Delete a plan
router.delete('/:id', async (req, res) => {
    try {
        await WorkoutPlan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete plan' });
    }
});

module.exports = router;
