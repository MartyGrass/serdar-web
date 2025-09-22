export default async function Page() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/hello`, { cache: 'no-store' })
  const data = await res.json().catch(() => ({ message: 'API not reachable' }))

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold">Full-Stack Starter</h1>
      <p className="mt-3 text-gray-700">
        API says: <span className="font-medium">{data.message}</span>
      </p>
    </main>
  )
}
