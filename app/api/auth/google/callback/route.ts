import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            console.error("[Google OAuth] Error:", error);
            return NextResponse.redirect(new URL("/login?error=google_denied", req.url));
        }

        if (!code) {
            return NextResponse.redirect(new URL("/login?error=no_code", req.url));
        }

        const clientId = process.env.GOOGLE_CLIENT_ID!;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

        // Exchange code for tokens
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
            console.error("[Google OAuth] Token exchange failed:", tokenData);
            return NextResponse.redirect(new URL("/login?error=token_failed", req.url));
        }

        // Get user info from Google
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const googleUser = await userInfoRes.json();

        if (!googleUser.email) {
            return NextResponse.redirect(new URL("/login?error=no_email", req.url));
        }

        console.log("[Google OAuth] User:", googleUser.email, googleUser.name);

        // Find or create user in database
        let user = await db.user.findUnique({ where: { email: googleUser.email } });

        if (!user) {
            user = await db.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name || null,
                    avatarUrl: googleUser.picture || null,
                },
            });
            console.log("[Google OAuth] Created new user:", user.id);
        } else {
            // Update name and avatar if they were empty
            if (!user.name || !user.avatarUrl) {
                user = await db.user.update({
                    where: { id: user.id },
                    data: {
                        name: user.name || googleUser.name || null,
                        avatarUrl: user.avatarUrl || googleUser.picture || null,
                    },
                });
            }
        }

        // Create session
        await createSession(user.id);

        // Redirect to dashboard
        return NextResponse.redirect(new URL("/scan", req.url));
    } catch (error) {
        console.error("[Google OAuth] Callback error:", error);
        return NextResponse.redirect(new URL("/login?error=callback_failed", req.url));
    }
}
