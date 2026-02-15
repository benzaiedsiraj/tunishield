import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
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

        // Check for the most recent attempt
        // @ts-ignore
        const lastAttempt = await db.quizAttempt.findFirst({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (!lastAttempt) {
            return NextResponse.json({ canPlay: true });
        }

        const lastAttemptDate = new Date(lastAttempt.createdAt);
        const now = new Date();
        const diff = now.getTime() - lastAttemptDate.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            const remainingMs = (24 * 60 * 60 * 1000) - diff;
            return NextResponse.json({
                canPlay: false,
                remainingMs,
                lastScore: lastAttempt.score
            });
        }

        return NextResponse.json({ canPlay: true });

    } catch (error) {
        console.error("Error checking quiz availability:", error);
        return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
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
        const { score } = await req.json();

        // Used for connecting to the Quiz model if it exists, otherwise just store attempt
        // For this implementation we'll assume a default quiz ID or just store the attempt loosely if schema allows
        // Checking schema: QuizAttempt needs quizId. We might need to fetch a daily quiz or create a dummy one.
        // For MVP, we'll try to find a quiz or just use a placeholder if the schema allows loose relation (it doesn't usually).

        // Let's first check if a daily quiz exists, if not create one
        let quizId = "daily-quiz";

        // @ts-ignore
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // @ts-ignore
        let dailyQuiz = await db.quiz.findFirst({
            where: {
                date: {
                    gte: today
                }
            }
        });

        if (!dailyQuiz) {
            // Create a dummy quiz record for today to satisfy foreign key
            // @ts-ignore
            dailyQuiz = await db.quiz.create({
                data: {
                    date: new Date(),
                    questions: "[]",
                    language: "tn"
                }
            })
        }

        // @ts-ignore
        await db.quizAttempt.create({
            data: {
                userId,
                quizId: dailyQuiz.id,
                score,
                answers: "[]"
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error recording quiz attempt:", error);
        return NextResponse.json({ error: "Failed to record attempt" }, { status: 500 });
    }
}
