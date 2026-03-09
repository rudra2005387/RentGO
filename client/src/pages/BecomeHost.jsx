import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const STEPS = [
  { icon: '📸', title: 'Tell us about your place', desc: 'Share some basic info, like where it is and how many guests can stay.' },
  { icon: '✨', title: 'Make it stand out', desc: "Add 5 or more photos plus a title and description — we'll help you out." },
  { icon: '💰', title: 'Finish up and publish', desc: 'Choose a starting price, verify a few details, then publish your listing.' },
];

const PERKS = [
  { icon: '🛡️', title: 'Aircover for Hosts', desc: 'Top-to-bottom protection. Always included, always free.' },
  { icon: '📊', title: 'Smart pricing tools', desc: 'Suggested prices based on demand, seasonality, and similar listings.' },
  { icon: '🌍', title: 'Reach millions of guests', desc: 'Guests search RentGo in thousands of cities across the globe.' },
  { icon: '💬', title: 'Dedicated support', desc: 'Our team is available around the clock for hosts.' },
];

const BecomeHost = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF385C] via-[#E31C5F] to-[#BD1D5E] text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400')] bg-cover bg-center opacity-15" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
          >
            Turn your extra space<br />into extra income
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl mx-auto"
          >
            Join thousands of hosts earning on RentGo. List your property in minutes and start welcoming guests.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/create-listing"
              className="px-8 py-3.5 bg-white text-[#FF385C] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-base"
            >
              Get started
            </Link>
            {user && (
              <Link
                to="/host/dashboard"
                className="px-8 py-3.5 bg-white/15 backdrop-blur border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-all text-base"
              >
                Host dashboard
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-[#222222] text-center mb-12">
          It's easy to get started on RentGo
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <span className="absolute -top-2 -left-1 text-5xl font-bold text-[#FF385C]/10">{i + 1}</span>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-[#222222] mb-2">{step.title}</h3>
              <p className="text-[#717171] text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="bg-[#F7F7F7]">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[#222222] text-center mb-12">
            Host with confidence
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#EBEBEB] hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{perk.icon}</div>
                <h3 className="font-semibold text-[#222222] mb-1.5">{perk.title}</h3>
                <p className="text-sm text-[#717171] leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-20 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#222222] mb-4">Ready to start hosting?</h2>
        <p className="text-[#717171] mb-8 max-w-lg mx-auto">
          List your property for free and start earning. You choose the price, schedule, and house rules.
        </p>
        <Link
          to="/create-listing"
          className="inline-block px-8 py-3.5 bg-[#FF385C] text-white font-semibold rounded-xl shadow-lg hover:bg-[#e0314f] hover:shadow-xl transition-all text-base"
        >
          Start your listing
        </Link>
      </section>
    </div>
  );
};

export default BecomeHost;
