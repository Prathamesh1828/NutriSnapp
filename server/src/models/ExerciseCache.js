const mongoose = require('mongoose');

const exerciseCacheSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: { expires: '24h' }
    }
}, {
    timestamps: true
});

const ExerciseCache = mongoose.model('ExerciseCache', exerciseCacheSchema);
module.exports = ExerciseCache;
