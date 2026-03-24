const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    type: { 
        type: String, 
        enum: ['bug', 'feature'], 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'resolved'], 
        default: 'pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
