import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const P = '#FF385C';
const PD = '#E31C5F';
const HF = "'Fraunces', Georgia, serif";
const BF = "'DM Sans', system-ui, sans-serif";

const STEPS = [
  {
    num: '01',
    icon: '📸',
    title: 'Tell us about your place',
    desc: 'Share some basic info, like where it is and how many guests can stay.',
    color: '#FFF1F2',
    border: '#FECDD3',
  },
  {
    num: '02',
    icon: '✨',
    title: 'Make it stand out',
    desc: "Add 5 or more photos plus a title and description — we'll help you out.",
    color: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    num: '03',
    icon: '💰',
    title: 'Finish up and publish',
    desc: 'Choose a starting price, verify a few details, then publish your listing.',
    color: '#F0FDF4',
    border: '#BBF7D0',
  },
];

const PERKS = [
  { icon: '🛡️', title: 'Aircover for Hosts', desc: 'Top-to-bottom protection. Always included, always free.', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' },
  { icon: '📊', title: 'Smart pricing tools', desc: 'Suggested prices based on demand, seasonality, and similar listings.', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' },
  { icon: '🌍', title: 'Reach millions of guests', desc: 'Guests search RentGo in thousands of cities across the globe.', gradient: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' },
  { icon: '💬', title: 'Dedicated support', desc: 'Our team is available around the clock for hosts.', gradient: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Mumbai', quote: "I started hosting 6 months ago and already earned ₹2.4L. RentGo made it completely effortless.", avatar: '👩', rating: 5 },
  { name: 'Arjun K.', city: 'Bangalore', quote: "The smart pricing tool helped me increase my bookings by 40%. Incredible platform.", avatar: '👨', rating: 5 },
  { name: 'Meera T.', city: 'Goa', quote: "Hosting on RentGo transformed my spare room into a steady income stream.", avatar: '👩‍💼', rating: 5 },
];

const FAQS = [
  { q: "Do I need to be home while guests are there?", a: "No! Many hosts use self check-in options so you don't need to be present." },
  { q: "How much can I earn?", a: "Earnings vary by location, property type, and availability. Use our estimator to get a personalized estimate." },
  { q: "Is my home protected?", a: "Yes — RentGo's Aircover provides up to $1M in damage protection and liability insurance for every stay." },
  { q: "How do I get paid?", a: "Payments are sent directly to your bank account 24 hours after check-in. We support all major banks." },
];

export default function BecomeHost() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [nights, setNights] = useState(15);
  const [price, setPrice] = useState(3000);
  const estimate = Math.round(nights * price * 0.97);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: BF }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { display: none; }`}</style>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 45%, #C0143C 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.18,
        }} />
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '80px 24px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left: text */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'inline-block', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', color: '#fff', fontFamily: BF, fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 99, border: '1px solid rgba(255,255,255,.25)', marginBottom: 24, letterSpacing: '.08em', textTransform: 'uppercase' }}
            >
              🏠 Become a Host
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{ fontFamily: HF, fontSize: 'clamp(36px,5vw,60px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}
            >
              Turn your space<br />into extra income
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ fontFamily: BF, fontSize: 18, color: 'rgba(255,255,255,.82)', lineHeight: 1.65, marginBottom: 36, maxWidth: 460 }}
            >
              Join thousands of hosts on RentGo. List your property in minutes and start welcoming guests today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <Link
                to="/create-listing"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#fff', color: P, fontFamily: BF, fontWeight: 700, fontSize: 15,
                  padding: '14px 28px', borderRadius: 14, textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(0,0,0,.2)', transition: 'transform .2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                Get started for free →
              </Link>
              {user && (
                <Link
                  to="/host/dashboard"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                    color: '#fff', fontFamily: BF, fontWeight: 600, fontSize: 14,
                    padding: '14px 24px', borderRadius: 14, textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,.3)', transition: 'background .2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
                >
                  Host dashboard
                </Link>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: 24, marginTop: 40 }}
            >
              {[
                { val: '50K+', label: 'Active hosts' },
                { val: '₹2L+', label: 'Avg. annual income' },
                { val: '4.9★', label: 'Host satisfaction' },
              ].map((s, i) => (
                <div key={i}>
                  <p style={{ fontFamily: HF, fontSize: 22, fontWeight: 700, color: '#fff' }}>{s.val}</p>
                  <p style={{ fontFamily: BF, fontSize: 11, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Earnings estimator card */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(20px)',
              borderRadius: 28, padding: '32px 28px',
              boxShadow: '0 32px 80px rgba(0,0,0,.25)',
              border: '1px solid rgba(255,255,255,.8)',
            }}
          >
            <p style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>💰 Earnings Estimator</p>
            <p style={{ fontFamily: HF, fontSize: 36, fontWeight: 700, color: '#111', lineHeight: 1 }}>₹{estimate.toLocaleString()}</p>
            <p style={{ fontFamily: BF, fontSize: 13, color: '#888', marginBottom: 28, marginTop: 4 }}>estimated per month</p>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: '#555' }}>Nights per month</label>
                <span style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: '#111' }}>{nights} nights</span>
              </div>
              <input
                type="range" min={1} max={30} value={nights}
                onChange={e => setNights(Number(e.target.value))}
                style={{ width: '100%', accentColor: P, height: 4, cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: '#555' }}>Price per night</label>
                <span style={{ fontFamily: BF, fontSize: 13, fontWeight: 700, color: '#111' }}>₹{price.toLocaleString()}</span>
              </div>
              <input
                type="range" min={500} max={15000} step={100} value={price}
                onChange={e => setPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: P, height: 4, cursor: 'pointer' }}
              />
            </div>

            <div style={{ background: '#FFF1F2', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <p style={{ fontFamily: BF, fontSize: 12, color: '#BE123C', lineHeight: 1.5 }}>
                Based on similar properties in your area. Actual earnings may vary.
              </p>
            </div>

            <Link
              to="/create-listing"
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: `linear-gradient(135deg, ${P}, ${PD})`,
                color: '#fff', fontFamily: BF, fontWeight: 700, fontSize: 15,
                padding: '15px', borderRadius: 14, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(255,56,92,.3)', transition: 'opacity .15s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Start listing your space →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <p style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>Simple process</p>
          <h2 style={{ fontFamily: HF, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
            It's easy to get started
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              style={{
                background: step.color, borderRadius: 24, padding: '32px 28px',
                border: `1px solid ${step.border}`, position: 'relative', overflow: 'hidden',
              }}
            >
              <span style={{
                position: 'absolute', top: -12, right: 16,
                fontFamily: HF, fontSize: 80, fontWeight: 700, color: 'rgba(0,0,0,.06)', lineHeight: 1,
              }}>
                {step.num}
              </span>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 18 }}>{step.icon}</span>
              <h3 style={{ fontFamily: HF, fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontFamily: BF, fontSize: 14, color: '#666', lineHeight: 1.65 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Perks ── */}
      <section style={{ background: '#F8F7F5' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <p style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>Why RentGo</p>
            <h2 style={{ fontFamily: HF, fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: '#111' }}>Host with confidence</h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: perk.gradient, borderRadius: 20, padding: '28px 22px',
                  border: '1px solid rgba(0,0,0,.05)',
                  transition: 'box-shadow .2s, transform .2s',
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: 36, display: 'block', marginBottom: 16 }}>{perk.icon}</span>
                <h3 style={{ fontFamily: BF, fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 8 }}>{perk.title}</h3>
                <p style={{ fontFamily: BF, fontSize: 13, color: '#666', lineHeight: 1.6 }}>{perk.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <h2 style={{ fontFamily: HF, fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, color: '#111' }}>Hear from our hosts</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ background: '#fff', borderRadius: 22, padding: '28px 24px', border: '1px solid #F0F0F0', boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}
            >
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} style={{ color: '#F59E0B', fontSize: 16 }}>★</span>
                ))}
              </div>
              <p style={{ fontFamily: BF, fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: 20 }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 32 }}>{t.avatar}</span>
                <div>
                  <p style={{ fontFamily: BF, fontWeight: 700, fontSize: 14, color: '#111' }}>{t.name}</p>
                  <p style={{ fontFamily: BF, fontSize: 12, color: '#888' }}>Host in {t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#F8F7F5' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontFamily: HF, fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, color: '#111', textAlign: 'center', marginBottom: 40 }}
          >
            Common questions
          </motion.h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0', overflow: 'hidden' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: BF, fontWeight: 600, fontSize: 15, color: '#111', textAlign: 'left', gap: 16,
                  }}
                >
                  {faq.q}
                  <span style={{ fontSize: 20, flexShrink: 0, transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)', color: P }}>+</span>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ padding: '0 22px 20px', borderTop: '1px solid #F7F7F7' }}
                  >
                    <p style={{ fontFamily: BF, fontSize: 14, color: '#666', lineHeight: 1.7, paddingTop: 14 }}>{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ background: `linear-gradient(135deg, ${P}, ${PD})`, padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}
          >
            <p style={{ fontFamily: BF, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>Start earning today</p>
            <h2 style={{ fontFamily: HF, fontSize: 'clamp(30px,5vw,50px)', fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Ready to start hosting?</h2>
            <p style={{ fontFamily: BF, fontSize: 16, color: 'rgba(255,255,255,.8)', marginBottom: 36, lineHeight: 1.65 }}>
              List your property for free. You choose the price, schedule, and house rules.
            </p>
            <Link
              to="/create-listing"
              style={{
                display: 'inline-block',
                background: '#fff', color: P, fontFamily: BF, fontWeight: 700, fontSize: 16,
                padding: '16px 40px', borderRadius: 14, textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,.2)', transition: 'transform .2s',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start your listing →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}