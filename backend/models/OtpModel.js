const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender.js");

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 10,
    }
});

// Function to send an email
async function sendEmail(email, otp) {
    try {
        const mail = await mailSender(
            email,
            "Verification Email",
            `<h1>Please confirm your OTP</h1>
             <p>Here is your OTP code: <strong>${otp}</strong></p>`
        );
        console.log("Email sent:", mail);
    } catch (error) {
        console.log("Error sending email:", error.message);
    }
}

// Send email before saving an OTP document
OtpSchema.pre("save", async function (next) {
    console.log("New OTP generated, sending email...");
    if (this.isNew) {
        await sendEmail(this.email, this.otp); // Now correctly using sendEmail function
    }
    next();
});

module.exports = mongoose.model("OTP", OtpSchema);
