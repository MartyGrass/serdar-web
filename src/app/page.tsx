export default async function Page() {
  const res = await fetch('http://localhost:3000/api/hello', { cache: 'no-store' })
  const data = await res.json().catch(() => ({ message: 'API not reachable' }))

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold">Full-Stack Starter</h1>
      <p className="mt-3 text-gray-700">API says: <span className="font-medium">{data.message}</span></p>

      <button className="mt-6 rounded-lg px-4 py-2 border hover:bg-white bg-gray-100">
        Tailwind OK
      </button>
    </main>
  )
}
