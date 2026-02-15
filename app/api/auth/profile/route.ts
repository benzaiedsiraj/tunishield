import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const data = updateProfileSchema.parse(body);

        const user = await db.user.update({
            where: { id: session.userId },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("[profile update error]", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 400 });
    }
}
