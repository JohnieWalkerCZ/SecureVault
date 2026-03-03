import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, titleIv, content, contentIv } = await req.json();

    const secret = await prisma.vault.create({
        data: {
            title,
            titleIv,
            content,
            contentIv,
            user: { connect: { email: session.user.email } }
        }
    });

    return NextResponse.json(secret);
}
export async function GET() {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secrets = await prisma.vault.findMany({
        where: { user: { email: session.user.email } },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(secrets);
}

export async function DELETE(req: Request) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
        }

        const note = await prisma.vault.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!note || note.user.email !== session.user.email) {
            return NextResponse.json({ error: "Unauthorized to delete this note" }, { status: 403 });
        }

        await prisma.vault.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }
}
