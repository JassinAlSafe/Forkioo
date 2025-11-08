export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Accounting software that{" "}
          <span className="text-primary-600">actually helps</span>
        </h1>

        <p className="mb-8 text-xl text-gray-600">
          Stop wondering what to do next. Forkioo tells you exactly what needs
          attention—from overdue invoices to upcoming tax deadlines.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href="/sign-up"
            className="rounded-lg bg-primary-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Get Started Free
          </a>
          <a
            href="/sign-in"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Sign In
          </a>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">⚡</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              First Invoice in 60s
            </h3>
            <p className="text-sm text-gray-600">
              From signup to sent invoice in under a minute. No complex setup
              required.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">🤖</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              AI That Learns
            </h3>
            <p className="text-sm text-gray-600">
              Smart categorization that gets better with every transaction you
              review.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">✅</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Smart To-Do List
            </h3>
            <p className="text-sm text-gray-600">
              Know exactly what needs attention. Prioritized, estimated time,
              one click away.
            </p>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          Free tier includes 10 invoices/month • No credit card required
        </div>
      </div>
    </main>
  );
}
