import { config } from "dotenv"
import nodemailer from 'nodemailer';
import ApiResponse from "./utils/apiResponse.js";
import { google } from "googleapis";
import path from "path";
import fs from "fs";
// import { getGmailClient } from "./utils/gmailClient.js";

config({ path: "./.env" });


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

// Authenticate with Gmail API
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
// Load token.json (refresh + access token)
const TOKEN_PATH = path.join(process.cwd(), "token.json");

function getOAuthClient() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const { client_secret, client_id, redirect_uris } = credentials.web;

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0] // usually "http://localhost:3001/oauth2callback"
    );

    // Load tokens (refresh + access) from token.json
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

export async function fetchEmails() {
    try {
        console.log("mimmijmmimp", (process.env.GOOGLE_CLIENT_SECRET));
        console.log("mimmijmmimp", `${process.env.GOOGLE_CLIENT_ID}`);
        console.log("mimmijmmimp", process.env.GOOGLE_REDIRECT_URI);
        console.log("mimmijmmimp", process.env.GOOGLE_REFRESH_TOKEN);
        const auth = getOAuthClient();
        const gmail = google.gmail({ version: "v1", auth });

        // Fetch the 5 most recent emails
        const res = await gmail.users.messages.list({
            userId: "me",
            maxResults: 5,
        });

        console.log(res);

        if (!res.data.messages || res.data.messages.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No emails found in inbox.",
                    },
                ],
            };
        }

        // Fetch details for each email
        const emails = [];
        for (const msg of res.data.messages) {
            const msgData = await gmail.users.messages.get({
                userId: "me",
                id: msg.id,
            });

            const headers = msgData.data.payload.headers;
            const subject = headers.find((h) => h.name === "Subject")?.value || "(No subject)";
            const from = headers.find((h) => h.name === "From")?.value || "(Unknown sender)";
            const snippet = msgData.data.snippet || "";

            emails.push(`From: ${from}\nSubject: ${subject}\nSnippet: ${snippet}`);
        }

        // Return in MCP response format ✅
        return {
            content: [
                {
                    type: "text",
                    text: emails.join("\n\n---\n\n"),
                },
            ],
        };
    } catch (error) {
        console.error("Error fetching emails:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching emails: ${error.message}`,
                },
            ],
        };
    }
}
