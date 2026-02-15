import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const verifyOtpSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code } = verifyOtpSchema.parse(body);

        const otp = await db.otpCode.findUnique({
            where: { email },
        });

        if (!otp) {
            return NextResponse.json({ error: "No code found. Please request a new one." }, { status: 400 });
        }

        if (otp.attempts >= 5) {
            return NextResponse.json({ error: "Too many attempts. Please request a new code." }, { status: 429 });
        }

        if (new Date() > otp.expiresAt) {
            return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
        }

        if (otp.code !== code) {
            await db.otpCode.update({
                where: { email },
                data: { attempts: { increment: 1 } },
            });
            return NextResponse.json({ error: "Invalid code" }, { status: 400 });
        }

        // Code valid - Find or Create User
        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
            user = await db.user.create({ data: { email } });
        }

        // Create session
        await createSession(user.id);

        // Delete used OTP
        await db.otpCode.delete({ where: { email } });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        console.error("[verify-otp error]", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }
}
