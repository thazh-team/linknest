
export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#fbfaf8] dark:bg-[#0f0f10] px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold">404</h1>
        <p className="mt-2 text-zinc-500">Page not found</p>
        <a href="/" className="mt-6 inline-block rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 h-10 px-5 leading-10">Home</a>
      </div>
    </div>
  )
}
