export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="section gradient-brand text-white">
        <div className="container-forkioo">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 animate-fade-in">
              Modern Booking
              <span className="block mt-2">Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl text-brand-100 mb-8 animate-slide-up">
              Professional scheduling and booking platform built for businesses that value simplicity and efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button className="btn-primary btn-lg">
                Get Started Free
              </button>
              <button className="btn-secondary btn-lg bg-white/10 border-white/20 text-white hover:bg-white/20">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-forkioo">
          <div className="text-center mb-16">
            <h2 className="mb-4">
              Built for <span className="text-gradient-brand">Modern Teams</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Everything you need to manage bookings, appointments, and schedules in one beautiful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-forkioo bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl mb-3">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-neutral-900 text-white">
        <div className="container-forkioo text-center">
          <h2 className="mb-6">Ready to streamline your bookings?</h2>
          <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Forkioo to manage their scheduling needs.
          </p>
          <button className="btn-primary btn-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-12">
        <div className="container-forkioo">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-white mb-2">Forkioo</p>
            <p className="mb-4">Modern booking made simple</p>
            <p className="text-sm">&copy; {new Date().getFullYear()} Forkioo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: '📅',
    title: 'Smart Scheduling',
    description: 'Intelligent calendar management that works with your availability and prevents double bookings.',
  },
  {
    icon: '🔔',
    title: 'Automated Reminders',
    description: 'Keep your clients informed with automated email and SMS notifications.',
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    description: 'Accept payments and deposits directly through the platform with industry-standard security.',
  },
  {
    icon: '📊',
    title: 'Analytics & Insights',
    description: 'Track your business performance with detailed analytics and reporting tools.',
  },
  {
    icon: '🔗',
    title: 'Easy Integration',
    description: 'Connect with your favorite tools like Google Calendar, Zoom, and more.',
  },
  {
    icon: '🛡️',
    title: 'Enterprise Security',
    description: 'Bank-level encryption and security to keep your data safe and compliant.',
  },
]
