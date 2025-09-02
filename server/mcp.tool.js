import { config } from "dotenv"
import nodemailer from 'nodemailer';
import ApiResponse from "./utils/apiResponse.js";

config()


// const twitterClient = new TwitterApi({
//     appKey: process.env.TWITTER_API_KEY,
//     appSecret: process.env.TWITTER_API_SECRET,
//     accessToken: process.env.TWITTER_ACCESS_TOKEN,
//     accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
// })

// export async function createPost(status) {
//     const newPost = await twitterClient.v2.tweet(status)

//     return {
//         content: [
//             {
//                 type: "text",
//                 text: `Tweeted: ${status}`
//             }
//         ]
//     }
// }

export async function sendEmail(email, subject, description) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const response = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: description,
        });

        if (response.rejected.length > 0) {
            return new ApiResponse(
                500,
                error.message,
                "failed to send email",
            );

        }
        return {
            content: [
                {
                    type: "text",
                    text: `Email sent successfully to ${email}`
                }
            ]
        }
    } catch (error) {
        console.error(error);
        return new ApiResponse(
            500,
            error.message,
            "failed to send email",
        );
    }
}

