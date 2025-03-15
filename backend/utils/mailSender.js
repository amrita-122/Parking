const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Set up OAuth2 client
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const mailSender = async (email, subject, body) => {
    try {
        const accessToken = await oauth2Client.getAccessToken();

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.GMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        let info = await transporter.sendMail({
            from: `"Smart Parking System" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: subject,
            html: body,
        });

        console.log("Email sent: ", info.response);
        return info;
    } catch (error) {
        console.log("Error sending email: ", error.message);
    }
};

module.exports = mailSender;
