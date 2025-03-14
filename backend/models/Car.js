const mongoose = require("mongoose");

// Car Schema
const CarSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    carMake: {
        type: String,
        required: true
    },
    carModel: {
        type: String,
        required: true
    },
    carColor: {
        type: String,
        required: true
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    isPrimary: {
        type: Boolean,
        default: false // If true, this is the user's default car for reservations
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

// Exporting the model
module.exports = mongoose.model("Car", CarSchema);
