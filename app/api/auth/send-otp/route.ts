import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

// Gmail SMTP transporter
const transporter = process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    })
    : null;

const sendOtpSchema = z.object({
    email: z.string().email(),
    type: z.enum(["login", "signup"]),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, type } = sendOtpSchema.parse(body);

        // Check user existence based on auth type
        const existingUser = await db.user.findUnique({ where: { email } });

        if (type === "login" && !existingUser) {
            return NextResponse.json(
                { success: false, error: "Account not found. Please sign up first." },
                { status: 404 }
            );
        }

        if (type === "signup" && existingUser) {
            return NextResponse.json(
                { success: false, error: "Account already exists. Please log in instead." },
                { status: 409 }
            );
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Upsert OTP
        await db.otpCode.upsert({
            where: { email },
            update: { code, expiresAt, attempts: 0 },
            create: { email, code, expiresAt },
        });

        console.log(`[DEV OTP] Code for ${email}: ${code}`);

        if (transporter) {
            try {
                await transporter.sendMail({
                    from: `"TuniShield" <${process.env.SMTP_EMAIL}>`,
                    to: email,
                    subject: "Your TuniShield Login Code",
                    html: `<div style="font-family:sans-serif;padding:20px;max-width:400px;margin:0 auto;background:#111;border-radius:12px;border:1px solid #333;">
                        <h2 style="color:#00ff9d;margin-bottom:16px;">TuniShield</h2>
                        <p style="color:#ccc;">Your verification code is:</p>
                        <div style="background:#222;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
                            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#fff;">${code}</span>
                        </div>
                        <p style="color:#888;font-size:12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
                    </div>`,
                });
                console.log(`[SMTP] Email sent to ${email}`);
            } catch (emailError) {
                console.warn(`[SMTP] Failed to send email to ${email}:`, emailError);
            }
        }

        return NextResponse.json({ success: true, message: "Code sent" });
    } catch (error) {
        console.error("[send-otp error]", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to send code" },
            { status: 400 }
        );
    }
}
