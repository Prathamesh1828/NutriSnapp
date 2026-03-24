const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    },
    notifications: {
        water: { type: Boolean, default: true },
        meal: { type: Boolean, default: true },
        workout: { type: Boolean, default: true },
    },
    ai: {
        provider: { type: String, enum: ['groq', 'openai', 'gemini'], default: 'groq' },
        apiKey: { type: String, default: '' },
    },
    analytics: { 
        type: Boolean, 
        default: true 
    },
    targets: {
        water: { type: Number, default: 3000 }, // ml
    }
}, { timestamps: true });

module.exports = mongoose.model('UserSettings', userSettingsSchema);
