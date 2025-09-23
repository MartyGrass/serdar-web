"use client";

import { useEffect, useState, useTransition } from "react";

type Todo = {
  id: string;
  title: string;
  description?: string;
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
        setError(e?.message ?? "Beklenmeyen bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addTodo = async () => {
    if (!title.trim()) return;
    setError(null);

    const optimistic: Todo = {
      id: `tmp-${crypto.randomUUID()}`,
      title: title.trim(),
      description: desc.trim() || undefined,
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
          description: optimistic.description,
        }),
      });
      if (!res.ok) throw new Error("Kayıt eklenemedi");
      const created: Todo = await res.json();
      setTodos((t) => [created, ...t.filter((x) => x.id !== optimistic.id)]);
    } catch (e: any) {
      setError(e?.message ?? "Ekleme hatası");
      setTodos((t) => t.filter((x) => x.id !== optimistic.id));
    }
  };

  const markDone = async (id: string) => {
    setError(null);
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: true } : x)));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Güncellenemedi");
    } catch (e: any) {
      setError(e?.message ?? "Güncelleme hatası");
      setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: false } : x)));
    }
  };

  const remove = async (id: string) => {
    setError(null);
    const keep = todos;
    setTodos((t) => t.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
    } catch (e: any) {
      setError(e?.message ?? "Silme hatası");
      setTodos(keep);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Todo App</h1>
            <p className="text-sm text-slate-500">
              Next.js + Prisma + Neon • küçük ama üretim-hazır bir örnek
            </p>
          </div>
          {!loading && !error && (
            <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {todos.length} kayıt
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-6">
        {/* Input Card */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startTransition(addTodo)}
              placeholder="Başlık…"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-slate-300"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Açıklama (opsiyonel)…"
              rows={2}
              className="flex-[1.5] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-offset-2 focus:ring-2 focus:ring-slate-300"
            />
            <button
              onClick={() => startTransition(addTodo)}
              disabled={!title.trim() || isPending}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Ekleniyor…" : "Ekle"}
            </button>
          </div>

          {/* Status */}
          <div className="mt-3 min-h-5">
            {loading && (
              <span className="text-xs text-slate-500">Yükleniyor…</span>
            )}
            {error && (
              <span className="text-xs text-red-600">
                Hata: <span className="font-medium">{error}</span>
              </span>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!loading && !error && todos.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-10 text-center text-slate-500">
            Henüz todo yok. Yukarıdan bir tane ekle 🎯
          </div>
        )}

        {/* List */}
        <ul className="mt-6 space-y-3">
          {todos.map((t) => (
            <li
              key={t.id}
              className="group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-2.5 w-2.5 flex-none rounded-full transition ${
                      t.done
                        ? "bg-emerald-500"
                        : "bg-slate-300 group-hover:bg-slate-400"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm leading-6 ${
                        t.done
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {t.description}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!t.done && (
                    <button
                      onClick={() => markDone(t.id)}
                      className="rounded-lg border px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
                    >
                      Done
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.id)}
                    className="rounded-lg border px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
