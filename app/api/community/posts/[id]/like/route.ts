import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;
        const cookieStore = cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token.value);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = payload.id as string;

        // Check if like exists
        // @ts-ignore
        const existingLike = await db.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });

        if (existingLike) {
            // Unlike
            // @ts-ignore
            await db.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            // @ts-ignore
            await db.like.create({
                data: {
                    postId,
                    userId,
                },
            });
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json(
            { error: "Failed to toggle like" },
            { status: 500 }
        );
    }
}
