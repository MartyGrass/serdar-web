"use client";

import { useEffect, useState, useTransition } from "react";

type Todo = {
  id: string;
  title: string;
  description?: string | null;
  done: boolean;
  createdAt: string;
};

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Listeyi çek
  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/todos", { cache: "no-store" });
        if (!res.ok) throw new Error("Liste alınamadı");
        const data: Todo[] = await res.json();
        setTodos(data);
      } catch (e: any) {
        setError(e.message ?? "Beklenmeyen bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Ekle
  const addTodo = async () => {
    if (!title.trim()) return;
    setError(null);

    // optimistic kayıt
    const optimistic: Todo = {
      id: `tmp-${crypto.randomUUID()}`,
      title: title.trim(),
      description: desc.trim() ? desc.trim() : null,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((t) => [optimistic, ...t]);
    setTitle("");
    setDesc("");

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: optimistic.title,
          description: optimistic.description ?? null,
        }),
      });
      if (!res.ok) throw new Error("Kayıt eklenemedi");
      const created: Todo = await res.json();

      // tmp kaydı gerçek kayıtla değiştir
      setTodos((t) => [created, ...t.filter((x) => x.id !== optimistic.id)]);
    } catch (e: any) {
      setError(e.message ?? "Ekleme hatası");
      // optimistic’i geri al
      setTodos((t) => t.filter((x) => x.id !== optimistic.id));
    }
  };

  // Done / tamamla
  const markDone = async (id: string) => {
    setError(null);
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: true } : x)));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Güncellenemedi");
    } catch (e: any) {
      setError(e.message ?? "Güncelleme hatası");
      setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: false } : x)));
    }
  };

  // Sil
  const remove = async (id: string) => {
    setError(null);
    const keep = todos;
    setTodos((t) => t.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
    } catch (e: any) {
      setError(e.message ?? "Silme hatası");
      setTodos(keep);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-3xl font-bold tracking-tight">Todo App</h1>
        <p className="mt-1 text-sm text-gray-600">
          Basit bir Next.js + Prisma + Neon örneği
        </p>

        {/* input & add */}
        <div className="mt-6 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Yeni todo…"
            className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none"
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Açıklama (opsiyonel)…"
            rows={3}
            className="flex-[2] rounded-lg border bg-white px-3 py-2 text-sm outline-none"
          />

          <button
            onClick={() => startTransition(addTodo)}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!title.trim() || isPending}
          >
            {isPending ? "Ekleniyor…" : "Ekle"}
          </button>
        </div>

        {/* status / errors */}
        <div className="mt-3 min-h-6">
          {loading && (
            <span className="text-sm text-gray-500">Yükleniyor…</span>
          )}
          {error && <span className="text-sm text-red-600">Hata: {error}</span>}
          {!loading && !error && (
            <span className="text-sm text-gray-500">
              count: {Array.isArray(todos) ? todos.length : 0}
            </span>
          )}
        </div>

        {/* list */}
        <ul className="mt-4 space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="group rounded-lg border bg-white px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      t.done ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      t.done ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!t.done && (
                    <button
                      onClick={() => markDone(t.id)}
                      className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Done
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.id)}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    Sil
                  </button>
                </div>
              </div>

              {/* açıklama */}
              {t.description && (
                <div className="mt-2 text-xs text-gray-500">
                  {t.description}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
