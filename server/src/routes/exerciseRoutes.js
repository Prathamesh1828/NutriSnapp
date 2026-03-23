const express = require('express');
const exerciseDbService = require('../services/exerciseDbService');

const router = express.Router();

// Get list of body parts
router.get('/bodyparts', async (req, res) => {
    try {
        const data = await exerciseDbService.getBodyPartList();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get list of target muscles
router.get('/muscles', async (req, res) => {
    try {
        const data = await exerciseDbService.getTargetList();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get list of equipment
router.get('/equipment', async (req, res) => {
    try {
        const data = await exerciseDbService.getEquipmentList();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get exercises by target muscle
router.get('/target/:target', async (req, res) => {
    try {
        const data = await exerciseDbService.getExercisesByTarget(req.params.target);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get exercises by equipment
router.get('/equipment/:equipment', async (req, res) => {
    try {
        const data = await exerciseDbService.getExercisesByEquipment(req.params.equipment);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single exercise details
router.get('/:id', async (req, res) => {
    try {
        const data = await exerciseDbService.getExerciseById(req.params.id);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
