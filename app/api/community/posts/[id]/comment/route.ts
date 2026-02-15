import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(500, "Comment too long"),
});

// GET comments for a post
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;

        // @ts-ignore
        const comments = await db.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: { name: true },
                },
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

// POST new comment
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

        const body = await req.json();
        const result = createCommentSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // @ts-ignore
        const newComment = await db.comment.create({
            data: {
                content: result.data.content,
                postId,
                authorId: payload.id as string,
            },
            include: {
                author: { select: { name: true } }
            }
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}
