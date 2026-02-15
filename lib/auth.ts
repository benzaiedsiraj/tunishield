import { db } from "@/lib/db";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.SESSION_SECRET || "dev-secret-123";
const key = new TextEncoder().encode(SECRET_KEY);

export async function createSession(userId: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);

    // Store in DB for revocability
    await db.session.create({
        data: {
            userId,
            token,
            expiresAt: expires,
        },
    });

    (await cookies()).set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires,
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession() {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, key);
        return payload as { userId: string };
    } catch (error) {
        return null;
    }
}

export async function logout() {
    (await cookies()).delete("session");
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh logic if needed
    const parsed = await getSession();
    if (!parsed) return;

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: session,
        httpOnly: true,
        expires,
    });
    return res;
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key);
        return { id: payload.userId as string };
    } catch (error) {
        return null;
    }
}
