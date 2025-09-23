// src/app/api/todos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const todos = await prisma.todo.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  // Gövdeyi güvenli şekilde oku + tiple
  const { title: rawTitle, description: rawDesc } = (await req
    .json()
    .catch(() => ({}))) as {
    title?: string;
    description?: string;
  };

  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const description =
    typeof rawDesc === "string" && rawDesc.trim().length
      ? rawDesc.trim()
      : null;

  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: { title, description }, // Prisma şemanda description String? olduğu için uygun
  });

  return NextResponse.json(todo, { status: 201 });
}
