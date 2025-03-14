const mongoose = require("mongoose");

// Notification Schema
const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Links the notification to a user
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["reservation", "payment", "parking_update", "system_alert"], // Categorizing notifications
        required: true
    },
    isRead: {
        type: Boolean,
        default: false // Tracks if the user has seen the notification
    },
    timestamp: {
        type: Date,
        default: Date.now // Auto-logs the time of notification
    }
});

// Exporting Model
module.exports = mongoose.model("Notification", NotificationSchema);
