import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password, encryptionTest } = await req.json();

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                encryptionTest,
            },
        });

        return NextResponse.json({ user, message: "User created" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
}
