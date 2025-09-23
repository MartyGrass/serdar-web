import type { Todo } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE}/api/todos`, { cache: 'no-store' })
  if (!res.ok) return []
  return (await res.json()) as Todo[]
}

export default async function Page() {
  const todos = await getTodos()

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-bold">Todos</h1>

      <form
        className="mt-4 flex gap-2"
        action={async (formData) => {
          'use server'
          const title = String(formData.get('title') ?? '').trim()
          if (!title) return
          await fetch(`${BASE}/api/todos`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title }),
          })
          revalidatePath('/')
        }}
      >
        <input
          name="title"
          placeholder="add todo..."
          className="px-3 py-2 rounded border bg-white text-gray-900"
        />
        <button className="px-4 py-2 rounded border bg-gray-100 hover:bg-white">
          Add
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">count: {Array.isArray(todos) ? todos.length : 0}</p>

      <ul className="mt-2 space-y-2">
        {todos.map((t: Todo) => (
          <li key={t.id} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
            <span className={t.done ? 'line-through text-gray-400' : 'text-gray-900'}>{t.title}</span>
            <div className="ml-auto flex gap-2">
              {!t.done && (
                <form action={async () => {
                  'use server'
                  await fetch(`${BASE}/api/todos/${t.id}`, { method: 'PATCH' })
                  revalidatePath('/')
                }}>
                  <button className="px-2 py-1 rounded border">Done</button>
                </form>
              )}
              <form action={async () => {
                'use server'
                await fetch(`${BASE}/api/todos/${t.id}`, { method: 'DELETE' })
                revalidatePath('/')
              }}>
                <button className="px-2 py-1 rounded border">Delete</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
