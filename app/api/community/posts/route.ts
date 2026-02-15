import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Validation schema for creating a post
const createPostSchema = z.object({
    title: z.string().min(3, "Title too short").max(100, "Title too long"),
    body: z.string().min(10, "Content too short"),
    category: z.enum(["D17", "Phishing", "Phone", "WhatsApp", "Other"]),
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "All";
        const skip = (page - 1) * limit;

        const where: any = {};

        if (category !== "All") {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } }, // SQLite doesn't support mode: 'insensitive' easily, so we rely on exact match or basic contains
                { body: { contains: search } },
            ];
        }

        const [posts, total] = await Promise.all([
            // @ts-ignore - bypassing stale prisma types
            db.post.findMany({
                where,
                take: limit,
                skip,
                orderBy: { createdAt: "desc" },
                include: {
                    author: {
                        select: { name: true },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),
            db.post.count({ where }),
        ]);

        return NextResponse.json({
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        // 1. Verify User
        const cookieStore = cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token.value);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // 2. Validate Input
        const body = await req.json();
        const result = createPostSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { title, body: content, category } = result.data;

        // 3. Create Post
        // @ts-ignore - bypassing stale prisma types
        const newPost = await db.post.create({
            data: {
                title,
                body: content,
                category,
                authorId: payload.id as string,
                tags: "",
                // published removed
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }
}
