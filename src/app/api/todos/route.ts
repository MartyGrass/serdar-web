// /api/todos
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      done: true,
      createdAt: true,
    },
  });
  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const rawTitle = typeof body?.title === "string" ? body.title : "";
  const title = rawTitle.trim();

  const rawDesc =
    typeof body?.description === "string" ? body.description : undefined;
  const description =
    rawDesc && rawDesc.trim().length > 0 ? rawDesc.trim() : undefined;

  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: { title, description },
    select: {
      id: true,
      title: true,
      description: true,
      done: true,
      createdAt: true,
    },
  });

  return NextResponse.json(todo, { status: 201 });
}
