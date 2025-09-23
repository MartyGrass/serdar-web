import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { id: string }

export async function PATCH(_req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params
  const { count } = await prisma.todo.updateMany({ where: { id }, data: { done: true } })
  if (count === 0) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true, updated: count })
}

export async function DELETE(_req: Request, ctx: { params: Promise<Params> }) {
  const { id } = await ctx.params
  const { count } = await prisma.todo.deleteMany({ where: { id } })
  if (count === 0) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true, deleted: count })
}
