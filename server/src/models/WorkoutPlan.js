const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    weeks: {
        type: Number
    },
    days: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    exercises: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    notes: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
module.exports = WorkoutPlan;
