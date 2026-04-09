import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FaShareAlt, FaStar, FaWifi, FaUtensils, FaParking,
  FaTv, FaHeart, FaChevronLeft, FaChevronRight, FaTimes,
  FaSwimmingPool, FaDumbbell, FaSnowflake, FaBath, FaTree, FaShower,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import HostInfo from '../components/HostInfo.jsx';
import ReviewList from '../components/ReviewList.jsx';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import apiClient from '../config/apiClient';

/* ── fonts ── */
let _fontsLoaded = false;
function loadFonts() {
  if (_fontsLoaded || typeof document === 'undefined') return;
  _fontsLoaded = true;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap';
  document.head.appendChild(l);
}

/* ── design tokens ── */
const T = {
  primary:     '#FF385C',
  primaryDark: '#E31C5F',
  text:        '#222222',
  sub:         '#717171',
  border:      '#DDDDDD',
  borderLight: '#EBEBEB',
  bg:          '#FFFFFF',
  bgSoft:      '#F7F7F7',
  radius:      { card: 16, input: 12, tag: 8 },
  shadow: {
    card: '0 8px 32px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.05)',
    button: '0 4px 18px rgba(255,56,92,.35)',
  },
};
const HF = "'Fraunces', Georgia, serif";
const BF = "'DM Sans', system-ui, sans-serif";

/* ════════════════════════════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
════════════════════════════════════════════════════════════════════ */
const TOAST_ICONS = {
  success: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#22C55E"/>
      <path d="M6 11.5L9.5 15L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#EF4444"/>
      <path d="M7 7L15 15M15 7L7 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill="#3B82F6"/>
      <path d="M11 10v5M11 7.5v.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{ position:'fixed', top:24, right:24, zIndex:99999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity:0, x:60, scale:.92 }}
            animate={{ opacity:1, x:0,  scale:1 }}
            exit={{   opacity:0, x:60,  scale:.92 }}
            transition={{ type:'spring', stiffness:420, damping:32 }}
            style={{ pointerEvents:'all' }}
          >
            <div style={{
              display:'flex', alignItems:'flex-start', gap:14,
              background:'#fff',
              border:`1px solid ${t.type==='success'?'#BBF7D0':t.type==='error'?'#FECACA':'#BFDBFE'}`,
              borderLeft:`4px solid ${t.type==='success'?'#22C55E':t.type==='error'?'#EF4444':'#3B82F6'}`,
              borderRadius:14,
              padding:'16px 18px',
              minWidth:320, maxWidth:400,
              boxShadow:'0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
              fontFamily:BF,
            }}>
              <div style={{flexShrink:0, marginTop:1}}>{TOAST_ICONS[t.type]||TOAST_ICONS.info}</div>
              <div style={{flex:1, minWidth:0}}>
                {t.title && (
                  <p style={{fontWeight:700, fontSize:14, color:'#111', margin:'0 0 3px'}}>{t.title}</p>
                )}
                <p style={{fontSize:13, color:'#555', margin:0, lineHeight:1.5}}>{t.message}</p>
              </div>
              <button onClick={()=>onRemove(t.id)} style={{flexShrink:0,background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:18,lineHeight:1,padding:'0 0 0 4px', marginTop:-1}}>×</button>
            </div>
            <motion.div
              initial={{ scaleX:1 }}
              animate={{ scaleX:0 }}
              transition={{ duration: (t.duration||4000)/1000, ease:'linear' }}
              style={{
                height:2,
                background: t.type==='success'?'#22C55E':t.type==='error'?'#EF4444':'#3B82F6',
                borderRadius:'0 0 14px 14px',
                transformOrigin:'left',
                marginTop:-1,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((type, title, message, duration=4000) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, type, title, message, duration }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration + 400);
    return id;
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, remove,
    success: (title, msg, dur) => add('success', title, msg, dur),
    error:   (title, msg, dur) => add('error',   title, msg, dur),
    info:    (title, msg, dur) => add('info',     title, msg, dur),
  };
}

/* ════════════════════════════════════════════════════════════════════
   BOOKING SUCCESS MODAL
════════════════════════════════════════════════════════════════════ */
function BookingSuccessModal({ booking, listing, checkIn, checkOut, guests, onClose, onGoToDashboard }) {
  const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / 86400000) : 0;
  const fmt = d => d?.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity:0 }}
        animate={{ opacity:1 }}
        exit={{ opacity:0 }}
        style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity:0, scale:.88, y:30 }}
          animate={{ opacity:1, scale:1,   y:0  }}
          exit={{   opacity:0, scale:.88,  y:30 }}
          transition={{ type:'spring', stiffness:340, damping:28 }}
          onClick={e => e.stopPropagation()}
          style={{ background:'#fff', borderRadius:24, padding:'40px 36px', maxWidth:480, width:'100%', boxShadow:'0 32px 80px rgba(0,0,0,.22)', position:'relative', fontFamily:BF, textAlign:'center' }}
        >
          {['#FF385C','#22C55E','#3B82F6','#F59E0B','#8B5CF6'].map((c,i) => (
            <motion.div key={i}
              initial={{ y:0, x:0, opacity:1, scale:1 }}
              animate={{ y:[-10,-60-i*15], x:[(i%2?1:-1)*(20+i*12)], opacity:[1,1,0], scale:[1,.5,0] }}
              transition={{ duration:1.2, delay:i*.08, ease:'easeOut' }}
              style={{ position:'absolute', top:40, left:'50%', width:10, height:10, borderRadius:'50%', background:c, pointerEvents:'none' }}
            />
          ))}

          <motion.div
            initial={{ scale:0 }}
            animate={{ scale:1 }}
            transition={{ type:'spring', stiffness:500, damping:22, delay:.1 }}
            style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#22C55E,#16A34A)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <motion.path
                d="M9 19.5L16 27L29 12"
                stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength:0 }}
                animate={{ pathLength:1 }}
                transition={{ duration:.5, delay:.3, ease:'easeOut' }}
              />
            </svg>
          </motion.div>

          <h2 style={{ fontFamily:HF, fontSize:26, fontWeight:700, color:'#111', marginBottom:8, marginTop:0 }}>
            Booking confirmed! 🎉
          </h2>
          <p style={{ fontSize:14, color:'#717171', marginBottom:28, lineHeight:1.6 }}>
            Your trip to <b style={{color:'#222'}}>{listing?.location?.city || listing?.title}</b> is confirmed. Check your email for details.
          </p>

          <div style={{ background:'#F7F7F7', borderRadius:16, padding:'20px 22px', textAlign:'left', marginBottom:28 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              {[
                { label:'Check-in',  val: fmt(checkIn)  },
                { label:'Check-out', val: fmt(checkOut) },
              ].map(r => (
                <div key={r.label}>
                  <p style={{ fontSize:10, fontWeight:800, color:'#aaa', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>{r.label}</p>
                  <p style={{ fontSize:14, fontWeight:600, color:'#222' }}>{r.val}</p>
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid #E5E5E5', paddingTop:14, display:'flex', gap:24 }}>
              <div>
                <p style={{ fontSize:10, fontWeight:800, color:'#aaa', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Guests</p>
                <p style={{ fontSize:14, fontWeight:600, color:'#222' }}>{guests} guest{guests!==1?'s':''}</p>
              </div>
              <div>
                <p style={{ fontSize:10, fontWeight:800, color:'#aaa', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Duration</p>
                <p style={{ fontSize:14, fontWeight:600, color:'#222' }}>{nights} night{nights!==1?'s':''}</p>
              </div>
              {booking?._id && (
                <div>
                  <p style={{ fontSize:10, fontWeight:800, color:'#aaa', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Booking ID</p>
                  <p style={{ fontSize:12, fontWeight:600, color:'#888', fontFamily:'monospace' }}>#{booking._id.slice(-8).toUpperCase()}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button
              onClick={onGoToDashboard}
              style={{ width:'100%', padding:'14px', background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`, color:'#fff', border:'none', borderRadius:12, fontFamily:BF, fontWeight:700, fontSize:15, cursor:'pointer', boxShadow:'0 4px 18px rgba(255,56,92,.35)' }}
            >
              View my bookings
            </button>
            <button
              onClick={onClose}
              style={{ width:'100%', padding:'13px', background:'#fff', color:'#222', border:'1.5px solid #ddd', borderRadius:12, fontFamily:BF, fontWeight:600, fontSize:14, cursor:'pointer' }}
            >
              Back to listing
            </button>
          </div>

          <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:36, height:36, borderRadius:'50%', background:'#f5f5f5', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#666' }}>×</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── amenity config ── */
const AMENITY = {
  'WiFi':             { Icon: FaWifi,         bg:'#EFF6FF', fg:'#2563EB' },
  'Kitchen':          { Icon: FaUtensils,     bg:'#FFF7ED', fg:'#EA580C' },
  'Parking':          { Icon: FaParking,      bg:'#F5F3FF', fg:'#7C3AED' },
  'TV':               { Icon: FaTv,           bg:'#F0FDFA', fg:'#0D9488' },
  'Pool':             { Icon: FaSwimmingPool, bg:'#EFF6FF', fg:'#0284C7' },
  'Gym':              { Icon: FaDumbbell,     bg:'#FFF1F2', fg:'#E11D48' },
  'Air conditioning': { Icon: FaSnowflake,   bg:'#ECFEFF', fg:'#0891B2' },
  'Hot tub':          { Icon: FaBath,         bg:'#FDF4FF', fg:'#A21CAF' },
  'Garden':           { Icon: FaTree,         bg:'#F0FDF4', fg:'#16A34A' },
  'Washer':           { Icon: FaShower,       bg:'#F5F3FF', fg:'#7C3AED' },
  'Heating':          { Icon: FaSnowflake,   bg:'#FFF7ED', fg:'#C2410C' },
};

/* ════════════════════════════════════════════════════════════════════
   IMAGE GRID
════════════════════════════════════════════════════════════════════ */
function ImageGrid({ images = [], title = '' }) {
  const [open, setOpen] = useState(false);
  const [cur,  setCur]  = useState(0);
  const imgs = images.length ? images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900'];

  return (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridTemplateRows:'repeat(2,200px)', gap:4, borderRadius:T.radius.card, overflow:'hidden', cursor:'pointer', position:'relative' }}
        onClick={() => setOpen(true)}>
        <div style={{ gridColumn:'span 2', gridRow:'span 2', overflow:'hidden' }}>
          <img src={imgs[0]} alt={title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .55s' }}
            onMouseOver={e=>e.currentTarget.style.transform='scale(1.04)'}
            onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} />
        </div>
        {[1,2,3,4].map(i=>(
          <div key={i} style={{ overflow:'hidden', background:'#f0ece8' }}>
            {imgs[i] && <img src={imgs[i]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .55s', display:'block' }}
              onMouseOver={e=>e.currentTarget.style.transform='scale(1.04)'}
              onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} />}
          </div>
        ))}
        <button onClick={e=>{e.stopPropagation();setOpen(true);}}
          style={{ position:'absolute', bottom:16, right:16, display:'flex', alignItems:'center', gap:7, background:'#fff', border:`1.5px solid ${T.text}`, borderRadius:T.radius.input, padding:'9px 16px', fontFamily:BF, fontSize:13, fontWeight:700, color:T.text, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,.12)', zIndex:2 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="#222" strokeWidth="1.5"/>
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="#222" strokeWidth="1.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="#222" strokeWidth="1.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="#222" strokeWidth="1.5"/>
          </svg>
          Show all photos
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}}
            style={{ position:'fixed', inset:0, background:'#0d0d0d', zIndex:9999, display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
              <button onClick={()=>setOpen(false)} style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,.1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><FaTimes size={14}/></button>
              <span style={{ fontFamily:BF, fontSize:13, color:'rgba(255,255,255,.55)' }}>{cur+1} / {imgs.length}</span>
              <div style={{width:40}}/>
            </div>
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative' }}>
              <motion.img key={cur} initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{duration:.18}}
                src={imgs[cur]} alt="" style={{ maxHeight:'100%', maxWidth:'100%', objectFit:'contain', borderRadius:10 }} />
              {imgs.length>1 && <>
                <button onClick={()=>setCur(i=>(i-1+imgs.length)%imgs.length)} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><FaChevronLeft/></button>
                <button onClick={()=>setCur(i=>(i+1)%imgs.length)} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><FaChevronRight/></button>
              </>}
            </div>
            <div style={{ display:'flex', gap:6, padding:'10px 24px', overflowX:'auto', justifyContent:'center', borderTop:'1px solid rgba(255,255,255,.08)' }}>
              {imgs.map((img,i)=>(
                <button key={i} onClick={()=>setCur(i)} style={{ flexShrink:0, width:60, height:44, borderRadius:7, overflow:'hidden', border:`2px solid ${i===cur?'#fff':'transparent'}`, opacity:i===cur?1:.4, cursor:'pointer', padding:0, background:'none' }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   AIRBNB-STYLE CALENDAR
════════════════════════════════════════════════════════════════════ */
function AirbnbCalendar({ unavailableDates = [], checkIn, checkOut, activeField, onDatesSelected }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [view,    setView]    = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hovered, setHovered] = useState(null);

  const pickingEnd = activeField === 'checkout' && !!checkIn;

  const blocked = useMemo(() => {
    const s = new Set();
    unavailableDates.forEach(d => { const x = new Date(d); x.setHours(0,0,0,0); s.add(x.getTime()); });
    return s;
  }, [unavailableDates]);

  const isOff = d => !d || d < today || blocked.has(d.getTime());

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  function mkGrid(y, m) {
    const first = new Date(y, m, 1).getDay();
    const last  = new Date(y, m+1, 0).getDate();
    const cells = Array(first).fill(null);
    for (let d = 1; d <= last; d++) cells.push(new Date(y, m, d));
    return cells;
  }

  const ly = view.getFullYear(), lm = view.getMonth();
  const rv = new Date(ly, lm+1, 1);
  const ry = rv.getFullYear(), rm = rv.getMonth();

  function pick(d) {
    if (!d || isOff(d)) return;

    if (!pickingEnd) {
      const newCheckOut = checkOut && d >= checkOut ? null : checkOut;
      onDatesSelected?.({ checkIn: d, checkOut: newCheckOut });
    } else {
      if (d <= checkIn) {
        onDatesSelected?.({ checkIn: d, checkOut: null });
        return;
      }
      let c = new Date(checkIn); c.setDate(c.getDate()+1);
      while (c < d) {
        if (blocked.has(c.getTime())) {
          onDatesSelected?.({ checkIn: d, checkOut: null });
          return;
        }
        c.setDate(c.getDate()+1);
      }
      onDatesSelected?.({ checkIn, checkOut: d });
    }
  }

  function getCellStyle(d) {
    if (!d) return {};
    const t   = d.getTime();
    const st  = checkIn?.getTime();
    const et  = checkOut?.getTime();
    const ht  = hovered?.getTime();
    const isS = st && t === st;
    const isE = et && t === et;
    const rangeEnd = et || (pickingEnd && ht);
    const inRange  = st && rangeEnd && d > checkIn && d.getTime() < rangeEnd;
    const off      = isOff(d);

    let bandBg = 'transparent';
    if (inRange) bandBg = '#F7F7F7';
    if (isS && rangeEnd) bandBg = 'linear-gradient(to right, transparent 50%, #F7F7F7 50%)';
    if (isE)             bandBg = 'linear-gradient(to right, #F7F7F7 50%, transparent 50%)';

    const dotFilled = isS || isE;
    const isToday   = t === today.getTime();

    return { bandBg, dotFilled, off, isToday };
  }

  function renderMonth(grid, y, m) {
    return (
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontFamily:BF, fontWeight:700, fontSize:13, color:T.text, textAlign:'center', marginBottom:14 }}>
          {MONTHS[m]} {y}
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ fontFamily:BF, fontSize:11, fontWeight:600, color:T.sub, textAlign:'center', padding:'3px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {grid.map((d, i) => {
            const { bandBg, dotFilled, off, isToday } = getCellStyle(d);
            const isHoverable = d && !off && !dotFilled;
            return (
              <div key={i}
                onClick={() => pick(d)}
                onMouseEnter={() => { if (d && !off && pickingEnd && checkIn && !checkOut) setHovered(d); }}
                onMouseLeave={() => setHovered(null)}
                style={{ height:44, display:'flex', alignItems:'center', justifyContent:'center', background: d ? bandBg : 'transparent', cursor: d ? (off ? 'default' : 'pointer') : 'default' }}
              >
                {d && (
                  <span
                    style={{
                      width:36, height:36,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      borderRadius:'50%',
                      background: dotFilled ? T.text : (isHoverable && hovered?.getTime()===d.getTime()) ? '#F0F0F0' : 'transparent',
                      color: dotFilled ? '#fff' : off ? '#C8C8C8' : T.text,
                      fontFamily: BF,
                      fontSize: 13,
                      fontWeight: dotFilled ? 700 : 400,
                      border: isToday && !dotFilled ? `1.5px solid ${T.text}` : 'none',
                      opacity: off ? 0.35 : 1,
                      transition: 'background .12s',
                      userSelect: 'none',
                      position: 'relative',
                      zIndex: 1,
                      textDecoration: off ? 'line-through' : 'none',
                    }}
                  >
                    {d.getDate()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / 86400000) : 0;
  const fmts   = d => d?.toLocaleDateString('en-US', { month:'short', day:'numeric' });

  const statusMsg = checkIn && checkOut
    ? <><b style={{fontWeight:700,color:T.text}}>{nights} night{nights!==1?'s':''}</b><span style={{color:T.sub}}> · {fmts(checkIn)} – {fmts(checkOut)}</span></>
    : checkIn
      ? <span style={{color:T.primary,fontWeight:500}}>Select your check-out date →</span>
      : <span style={{color:T.sub}}>Select your check-in date</span>;

  return (
    <div style={{ border:`1px solid ${T.border}`, borderRadius:T.radius.card, overflow:'hidden', background:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px 22px', borderBottom:`1px solid ${T.borderLight}` }}>
        <button onClick={() => setView(new Date(ly, lm-1, 1))}
          style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${T.border}`, background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:T.text, transition:'border-color .15s' }}
          onMouseOver={e=>e.currentTarget.style.borderColor=T.text}
          onMouseOut={e=>e.currentTarget.style.borderColor=T.border}>
          <FaChevronLeft size={10}/>
        </button>
        <span style={{ fontFamily:BF, fontWeight:600, fontSize:13, color:T.text }}>
          {MONTHS[lm]} {ly} — {MONTHS[rm]} {ry}
        </span>
        <button onClick={() => setView(new Date(ly, lm+1, 1))}
          style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${T.border}`, background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:T.text, transition:'border-color .15s' }}
          onMouseOver={e=>e.currentTarget.style.borderColor=T.text}
          onMouseOut={e=>e.currentTarget.style.borderColor=T.border}>
          <FaChevronRight size={10}/>
        </button>
      </div>

      <div style={{ display:'flex', gap:24, padding:'20px 22px' }}>
        {renderMonth(mkGrid(ly, lm), ly, lm)}
        <div style={{ width:1, background:T.borderLight, flexShrink:0 }}/>
        {renderMonth(mkGrid(ry, rm), ry, rm)}
      </div>

      <div style={{ borderTop:`1px solid ${T.borderLight}`, padding:'13px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:48 }}>
        <span style={{ fontFamily:BF, fontSize:13 }}>{statusMsg}</span>
        {(checkIn || checkOut) && (
          <button
            onClick={() => { setHovered(null); onDatesSelected?.({ checkIn:null, checkOut:null }); }}
            style={{ fontFamily:BF, fontSize:13, fontWeight:600, color:T.text, textDecoration:'underline', background:'none', border:'none', cursor:'pointer', textUnderlineOffset:2 }}>
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   AMENITIES
════════════════════════════════════════════════════════════════════ */
function AmenitiesGrid({ amenities = [] }) {
  const [all, setAll] = useState(false);
  const show = all ? amenities : amenities.slice(0, 10);
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
        {show.map(a => {
          const cfg = AMENITY[a] || {};
          const Ic  = cfg.Icon;
          return (
            <div key={a}
              style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, border:`1.5px solid ${T.borderLight}`, background:'#fafafa', transition:'border-color .15s, box-shadow .15s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='#ccc';e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,.06)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor=T.borderLight;e.currentTarget.style.boxShadow='none';}}>
              <div style={{ width:36, height:36, borderRadius:10, background:cfg.bg||'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {Ic ? <Ic style={{ color:cfg.fg||'#555', fontSize:15 }}/> : <span style={{fontSize:15}}>✓</span>}
              </div>
              <span style={{ fontFamily:BF, fontSize:14, fontWeight:500, color:T.text }}>{a}</span>
            </div>
          );
        })}
      </div>
      {amenities.length > 10 && (
        <button onClick={()=>setAll(v=>!v)}
          style={{ marginTop:16, fontFamily:BF, fontSize:14, fontWeight:600, color:T.text, background:'none', border:`1.5px solid ${T.text}`, borderRadius:10, padding:'11px 22px', cursor:'pointer' }}>
          {all ? 'Show less' : `Show all ${amenities.length} amenities`}
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   REVIEWS
════════════════════════════════════════════════════════════════════ */
function ReviewsSection({ reviews = [], averageRating = 0 }) {
  const [all, setAll] = useState(false);
  const show = all ? reviews : reviews.slice(0, 6);
  const bkd  = useMemo(() => {
    const m={5:0,4:0,3:0,2:0,1:0};
    reviews.forEach(r=>{const k=Math.round(r.overallRating||r.rating||0);if(k>=1&&k<=5)m[k]++;});
    return m;
  },[reviews]);
  const avg  = averageRating||(reviews.length?(reviews.reduce((s,r)=>s+(r.overallRating||r.rating||0),0)/reviews.length).toFixed(1):0);
  const PAL  = ['#FF385C','#0070f3','#00a699','#f97316','#8b5cf6','#10b981'];

  if (!reviews.length) return (
    <div style={{ textAlign:'center', padding:'36px 0' }}>
      <div style={{fontSize:44,marginBottom:12}}>✨</div>
      <p style={{ fontFamily:HF, fontSize:20, fontWeight:600, color:T.text, marginBottom:6 }}>No reviews yet</p>
      <p style={{ fontFamily:BF, fontSize:14, color:T.sub }}>Be the first to leave a review after your stay.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
        <FaStar style={{ color:T.text, fontSize:20 }}/>
        <span style={{ fontFamily:HF, fontSize:26, fontWeight:700, color:T.text }}>{Number(avg).toFixed(1)}</span>
        <span style={{ color:T.border }}>·</span>
        <span style={{ fontFamily:BF, fontSize:15, color:T.sub, textDecoration:'underline', cursor:'pointer' }}>{reviews.length} review{reviews.length!==1?'s':''}</span>
      </div>
      <div style={{ marginBottom:32, maxWidth:260 }}>
        {[5,4,3,2,1].map(s=>(
          <div key={s} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <span style={{ fontFamily:BF, fontSize:11, color:T.sub, width:8 }}>{s}</span>
            <div style={{ flex:1, height:4, background:T.borderLight, borderRadius:4, overflow:'hidden' }}>
              <motion.div initial={{width:0}} animate={{width:`${(bkd[s]/Math.max(1,reviews.length))*100}%`}} transition={{duration:.7,delay:(5-s)*.06}}
                style={{ height:'100%', background:T.text, borderRadius:4 }}/>
            </div>
            <span style={{ fontFamily:BF, fontSize:11, color:'#bbb', width:12, textAlign:'right' }}>{bkd[s]}</span>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:28 }}>
        {show.map((r,i) => {
          const name   = typeof r.author==='object' ? [r.author?.firstName,r.author?.lastName].filter(Boolean).join(' ') : r.author||'Guest';
          const rating = r.overallRating||r.rating||0;
          const date   = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : 'Recent';
          const init   = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
          return (
            <motion.div key={r._id||i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*.05}}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:PAL[i%PAL.length], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {r.author?.profileImage
                    ? <img src={r.author.profileImage} alt={name} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}}/>
                    : <span style={{color:'#fff',fontFamily:BF,fontWeight:700,fontSize:14}}>{init}</span>}
                </div>
                <div>
                  <p style={{ fontFamily:BF, fontWeight:600, fontSize:14, color:T.text, marginBottom:3 }}>{name}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    {[...Array(5)].map((_,j)=><FaStar key={j} style={{fontSize:10,color:j<rating?T.primary:'#e5e7eb'}}/>)}
                    <span style={{ fontFamily:BF, fontSize:12, color:'#bbb', marginLeft:4 }}>{date}</span>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily:BF, fontSize:14, lineHeight:1.65, color:'#484848' }}>
                {r.comment?.length>200 ? r.comment.slice(0,200)+'…' : r.comment}
              </p>
            </motion.div>
          );
        })}
      </div>
      {reviews.length>6 && (
        <button onClick={()=>setAll(v=>!v)}
          style={{ marginTop:24, fontFamily:BF, fontSize:14, fontWeight:600, color:T.text, background:'none', border:`1.5px solid ${T.text}`, borderRadius:10, padding:'11px 22px', cursor:'pointer' }}>
          {all ? 'Show less' : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   BOOKING WIDGET
════════════════════════════════════════════════════════════════════ */
function BookingWidget({ listing, checkIn, checkOut, guests, setGuests, onBook, loading: bLoading, onDatesSelected, unavailableDates }) {
  const { basePrice=0, cleaningFee=0, serviceFee=0 } = listing.pricing || {};
  const nights   = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / 86400000) : 0;
  const sub      = basePrice * nights;
  const taxes    = Math.round((sub + cleaningFee + serviceFee) * 0.12);
  const total    = sub + cleaningFee + serviceFee + taxes;
  const max      = listing.accommodates || listing.maxGuests || 10;
  const canBook  = checkIn && checkOut && nights > 0 && !bLoading;
  const fmt      = d => d ? d.toLocaleDateString('en-US', { month:'short', day:'numeric' }) : null;

  const [activeField, setActiveField]   = useState(null);
  const [showGuests,  setShowGuests]    = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setActiveField(null);
        setShowGuests(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleDates({ checkIn: ci, checkOut: co }) {
    onDatesSelected({ checkIn: ci, checkOut: co });
    if (ci && !co) setActiveField('checkout');
    if (ci && co)  setActiveField(null);
    if (!ci && !co) setActiveField('checkin');
  }

  const inputBase = (active, filled) => ({
    flex: 1,
    padding: '10px 14px',
    cursor: 'pointer',
    background: active ? '#fff' : 'transparent',
    transition: 'background .15s',
    outline: active ? `2px solid ${T.text}` : '2px solid transparent',
    outlineOffset: -2,
    borderRadius: 10,
  });

  return (
    <div style={{ fontFamily:BF }} ref={dropRef}>
      <div style={{ marginBottom:20 }}>
        <span style={{ fontFamily:HF, fontSize:26, fontWeight:700, color:T.text }}>${basePrice.toLocaleString()}</span>
        <span style={{ fontSize:15, color:T.sub }}> /night</span>
        {listing.averageRating > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4 }}>
            <FaStar style={{ color:T.primary, fontSize:12 }}/>
            <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{listing.averageRating.toFixed(1)}</span>
            {listing.totalReviews > 0 && (
              <span style={{ fontSize:13, color:T.sub }}>· {listing.totalReviews} review{listing.totalReviews!==1?'s':''}</span>
            )}
          </div>
        )}
      </div>

      <div style={{ border:`1.5px solid ${activeField ? T.text : T.border}`, borderRadius:T.radius.input, overflow:'visible', marginBottom:12, transition:'border-color .2s', position:'relative' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:`1px solid ${T.border}` }}>
          <button
            onClick={() => { setActiveField(activeField==='checkin' ? null : 'checkin'); setShowGuests(false); }}
            style={{ textAlign:'left', border:'none', borderRight:`1px solid ${T.border}`, background: activeField==='checkin'?'#fafafa':'transparent', cursor:'pointer', padding:'13px 14px', borderRadius:'10px 0 0 0', outline:'none' }}
          >
            <p style={{ fontSize:9, fontWeight:800, color:T.text, textTransform:'uppercase', letterSpacing:'.09em', marginBottom:4 }}>Check-in</p>
            <p style={{ fontSize:14, color: checkIn ? T.text : '#aaa', fontWeight: checkIn?500:400 }}>
              {fmt(checkIn) || 'Add date'}
            </p>
          </button>
          <button
            onClick={() => { setActiveField(activeField==='checkout' ? null : 'checkout'); setShowGuests(false); }}
            style={{ textAlign:'left', border:'none', background: activeField==='checkout'?'#fafafa':'transparent', cursor:'pointer', padding:'13px 14px', borderRadius:'0 10px 0 0', outline:'none' }}
          >
            <p style={{ fontSize:9, fontWeight:800, color:T.text, textTransform:'uppercase', letterSpacing:'.09em', marginBottom:4 }}>Check-out</p>
            <p style={{ fontSize:14, color: checkOut ? T.text : '#aaa', fontWeight: checkOut?500:400 }}>
              {fmt(checkOut) || 'Add date'}
            </p>
          </button>
        </div>

        <button
          onClick={() => { setShowGuests(v => !v); setActiveField(null); }}
          style={{ width:'100%', textAlign:'left', border:'none', background: showGuests?'#fafafa':'transparent', cursor:'pointer', padding:'13px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderRadius:'0 0 10px 10px', outline:'none' }}
        >
          <div>
            <p style={{ fontSize:9, fontWeight:800, color:T.text, textTransform:'uppercase', letterSpacing:'.09em', marginBottom:4 }}>Guests</p>
            <p style={{ fontSize:14, color:T.text, fontWeight:500 }}>{guests} guest{guests!==1?'s':''}</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showGuests ? 'rotate(180deg)' : 'rotate(0)', transition:'transform .2s', flexShrink:0 }}>
            <path d="M1 3.5L6 8.5L11 3.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <AnimatePresence>
          {showGuests && (
            <motion.div
              initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
              transition={{ duration:.18 }}
              style={{ position:'absolute', top:'100%', left:0, right:0, marginTop:4, background:'#fff', border:`1px solid ${T.border}`, borderRadius:T.radius.card, boxShadow:T.shadow.card, zIndex:200, padding:'16px 18px' }}
            >
              {[
                { label:'Adults', sublabel:'Ages 13 or above', key:'adults', val:guests, set:setGuests, mn:1, mx:max },
              ].map(row => (
                <div key={row.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <p style={{ fontFamily:BF, fontWeight:600, fontSize:14, color:T.text }}>{row.label}</p>
                    <p style={{ fontFamily:BF, fontSize:12, color:T.sub }}>{row.sublabel}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <button onClick={()=>row.set(Math.max(row.mn, row.val-1))} disabled={row.val<=row.mn}
                      style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${row.val<=row.mn?'#e5e7eb':'#888'}`, background:'none', color:row.val<=row.mn?'#e5e7eb':T.text, fontSize:20, fontWeight:300, cursor:row.val<=row.mn?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                    <span style={{ fontFamily:BF, fontSize:15, fontWeight:600, color:T.text, minWidth:18, textAlign:'center' }}>{row.val}</span>
                    <button onClick={()=>row.set(Math.min(row.mx, row.val+1))} disabled={row.val>=row.mx}
                      style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${row.val>=row.mx?'#e5e7eb':'#888'}`, background:'none', color:row.val>=row.mx?'#e5e7eb':T.text, fontSize:20, fontWeight:300, cursor:row.val>=row.mx?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                  </div>
                </div>
              ))}
              <button onClick={()=>setShowGuests(false)}
                style={{ marginTop:16, width:'100%', padding:'10px', background:T.text, color:'#fff', border:'none', borderRadius:10, fontFamily:BF, fontWeight:600, fontSize:14, cursor:'pointer' }}>
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeField && (
            <motion.div
              initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:.2 }}
              style={{ position:'absolute', top:'100%', left: activeField==='checkout' ? 'auto' : 0, right: activeField==='checkout' ? 0 : 'auto', marginTop:4, zIndex:300, minWidth:580 }}
            >
              <div style={{ background:'#fff', border:`1px solid ${T.border}`, borderRadius:T.radius.card, boxShadow:'0 12px 48px rgba(0,0,0,.16), 0 4px 16px rgba(0,0,0,.08)', overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:`1px solid ${T.borderLight}` }}>
                  {[{id:'checkin',lbl:'CHECK-IN',val:fmt(checkIn)},{id:'checkout',lbl:'CHECK-OUT',val:fmt(checkOut)}].map(f=>(
                    <button key={f.id} onClick={()=>setActiveField(f.id)}
                      style={{ padding:'14px 20px', textAlign:'left', border:'none', borderBottom: activeField===f.id?`2px solid ${T.text}`:'2px solid transparent', background:'transparent', cursor:'pointer', transition:'border-color .15s' }}>
                      <p style={{ fontSize:9, fontWeight:800, color:T.text, textTransform:'uppercase', letterSpacing:'.09em', marginBottom:3 }}>{f.lbl}</p>
                      <p style={{ fontFamily:BF, fontSize:15, fontWeight: f.val?600:400, color: f.val?T.text:'#aaa' }}>{f.val || 'Add date'}</p>
                    </button>
                  ))}
                </div>
                <div style={{ padding:'4px 0' }}>
                  <AirbnbCalendar
                    unavailableDates={unavailableDates}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    activeField={activeField}
                    onDatesSelected={handleDates}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={onBook} disabled={!canBook}
        style={{ width:'100%', padding:'15px', borderRadius:T.radius.input, border:'none', fontFamily:BF, fontSize:16, fontWeight:700, color:'#fff', cursor:canBook?'pointer':'not-allowed', background:canBook?`linear-gradient(135deg,${T.primary},${T.primaryDark})`:'#e5e7eb', boxShadow:canBook?T.shadow.button:'none', transition:'opacity .2s, transform .15s' }}
        onMouseOver={e=>{ if(canBook){e.currentTarget.style.opacity='.9';e.currentTarget.style.transform='scale(1.01)';} }}
        onMouseOut={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='scale(1)';}}>
        {bLoading ? 'Reserving…' : nights>0 ? `Reserve · $${total.toLocaleString()}` : 'Reserve'}
      </button>
      {nights > 0 && <p style={{ textAlign:'center', fontSize:13, color:T.sub, marginTop:10 }}>You won't be charged yet</p>}

      <AnimatePresence>
        {nights > 0 && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
            style={{ marginTop:20, paddingTop:20, borderTop:`1px solid ${T.borderLight}` }}>
            {[
              {l:`$${basePrice} × ${nights} night${nights!==1?'s':''}`, v:sub},
              cleaningFee>0 && {l:'Cleaning fee', v:cleaningFee},
              serviceFee>0  && {l:'Service fee',  v:serviceFee},
              {l:'Taxes (12%)', v:taxes},
            ].filter(Boolean).map((row,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:14, color:'#484848', textDecoration:'underline', textDecorationColor:'#ccc', textUnderlineOffset:2 }}>{row.l}</span>
                <span style={{ fontSize:14, color:T.text }}>${row.v.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:14, borderTop:`1.5px solid ${T.text}`, marginTop:4 }}>
              <span style={{ fontFamily:BF, fontSize:15, fontWeight:700, color:T.text }}>Total before taxes</span>
              <span style={{ fontFamily:HF, fontSize:17, fontWeight:700, color:T.text }}>${total.toLocaleString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SKELETON
════════════════════════════════════════════════════════════════════ */
function Sk({ w='100%', h=16, r=8, mb=0 }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize:'200% 100%', animation:'sk 1.6s infinite', marginBottom:mb }}/>;
}
function Skeleton() {
  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:BF }}>
      <style>{`@keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:24 }}>
        <Sk h={440} r={16} mb={32}/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:64 }}>
          <div>
            <Sk h={34} w="70%" r={6} mb={12}/><Sk h={18} w="45%" r={4} mb={28}/>
            <Sk h={1} mb={28}/><Sk h={80} r={12} mb={28}/><Sk h={1} mb={28}/>
            {[1,2,3].map(i=><Sk key={i} h={14} w={i===1?'100%':i===2?'85%':'70%'} r={4} mb={10}/>)}
          </div>
          <Sk h={380} r={16}/>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════ */
export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { notifyBookingConfirmed } = useNotifications();

  const [listing,     setListing]     = useState(null);
  const [reviews,     setReviews]     = useState([]);
  const [blocked,     setBlocked]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [checkIn,     setCheckIn]     = useState(null);
  const [checkOut,    setCheckOut]    = useState(null);
  const [guests,      setGuests]      = useState(1);
  const [bLoading,    setBLoading]    = useState(false);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadFonts();
    setLoading(true);
    Promise.all([
      apiClient.get(`/listings/${id}`).then(r=>r.data),
      apiClient.get(`/reviews/listing/${id}`).then(r=>r.data).catch(()=>({success:false})),
      apiClient.get(`/listings/${id}/availability`).then(r=>r.data).catch(()=>({success:false})),
    ]).then(([lr,rr,ar])=>{
      if (lr.success) setListing(lr.data?.listing||lr.data); else setError('Listing not found');
      if (rr.success) setReviews(rr.data?.reviews||[]);
      if (ar.success) setBlocked(ar.data?.blockedDates||ar.data?.unavailableDates||[]);
    }).catch(()=>setError('Network error')).finally(()=>setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!listing?._id) return;
    try {
      const key = 'rg_recently_viewed';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const compact = {
        _id: listing._id,
        title: listing.title,
        location: listing.location,
        pricing: listing.pricing,
        images: listing.images,
        averageRating: listing.averageRating,
        viewedAt: new Date().toISOString()
      };
      const updated = [compact, ...existing.filter((x) => x._id !== listing._id)].slice(0, 12);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // Ignore local storage failures.
    }
  }, [listing]);

  /* ── FIXED: handleBook with robust field names + detailed error surfacing ── */
  const handleBook = useCallback(async () => {
    if (!token) {
      toast.info('Login required', 'Please log in to make a reservation.');
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Dates required', 'Please select both check-in and check-out dates.');
      return;
    }
    if (guests < 1) {
      toast.error('Guests required', 'Please select at least 1 guest.');
      return;
    }
    if (checkIn >= checkOut) {
      toast.error('Invalid dates', 'Check-out date must be after check-in date.');
      return;
    }

    setBLoading(true);

    try {
      // Send all common field-name variants so the backend validator finds what it needs
      const payload = {
        listing: id,
        listingId: id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        guests,
        numberOfGuests: guests,
        guestCount: guests,
      };

      const res = await apiClient.post(`/bookings`, payload);

      const d = res.data;

      // Log full server response for debugging
      console.log('[Booking response]', res.status, JSON.stringify(d));

      if (d.success || res.status < 400) {
        const bookingObj = d.data?.booking || d.data || d.booking || d;
        notifyBookingConfirmed(bookingObj, listing?.title, listing?.location?.city);
        setBLoading(false);
        setSuccessBooking(bookingObj);
        return;
      }

      setBLoading(false);

      // Surface the most specific error message available
      const errMsg =
        d.message ||
        d.error ||
        (Array.isArray(d.errors)
          ? d.errors.map(e => e.msg || e.message || e.path || JSON.stringify(e)).join(', ')
          : typeof d.errors === 'object' && d.errors !== null
          ? Object.values(d.errors).map(e => (typeof e === 'string' ? e : e?.message || JSON.stringify(e))).join(', ')
          : null) ||
        'Please try again.';

      toast.error('Booking failed', errMsg);
    } catch (err) {
      setBLoading(false);
      console.error('[Booking error]', err);
      toast.error('Booking failed', 'Network error. Please check your connection.');
    }
  }, [token, checkIn, checkOut, guests, id, navigate, toast, listing, notifyBookingConfirmed]);

  if (loading) return <Skeleton/>;
  if (error||!listing) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:BF }}>
      <div style={{ textAlign:'center' }}>
        <div style={{fontSize:56,marginBottom:16}}>🏠</div>
        <p style={{ fontFamily:HF,fontSize:22,fontWeight:600,color:T.text,marginBottom:8 }}>Listing not found</p>
        <Link to="/" style={{ fontSize:14,fontWeight:600,color:T.primary,textDecoration:'underline' }}>← Back to Home</Link>
      </div>
    </div>
  );

  const images  = (listing.images||[]).map(i=>i.url||i).filter(Boolean);
  const loc     = listing.location||{};
  const locStr  = [loc.city,loc.state,loc.country].filter(Boolean).join(', ');
  const hd      = listing.host||{};
  const hName   = [hd.firstName,hd.lastName].filter(Boolean).join(' ')||'Host';
  const hostObj = { name:hName, avatar:hd.profileImage, isSuperhost:hd.isSuperhost, responseRate:hd.responseRate?`${hd.responseRate}%`:undefined, bio:hd.bio, rating:hd.averageRating };
  const propType = listing.propertyType?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())||'Property';
  const nights  = checkIn&&checkOut ? Math.ceil((checkOut-checkIn)/86400000) : 0;

  const amenities = listing.amenities && !Array.isArray(listing.amenities)
    ? [listing.amenities.basics?.wifi&&'WiFi',listing.amenities.basics?.kitchen&&'Kitchen',listing.amenities.basics?.airConditioning&&'Air conditioning',listing.amenities.basics?.heating&&'Heating',listing.amenities.features?.pool&&'Pool',listing.amenities.features?.gym&&'Gym',listing.amenities.features?.tv&&'TV',listing.amenities.features?.washer&&'Washer',listing.amenities.features?.hotTub&&'Hot tub',listing.amenities.features?.parking&&'Parking',listing.amenities.outdoor?.garden&&'Garden'].filter(Boolean)
    : (Array.isArray(listing.amenities)?listing.amenities:[]);

  const S = ({children, last=false}) => (
    <div style={{ padding:'32px 0', ...(last?{}:{borderBottom:`1px solid ${T.borderLight}`}) }}>{children}</div>
  );
  const Title = ({children}) => (
    <h2 style={{ fontFamily:HF, fontSize:22, fontWeight:600, color:T.text, marginBottom:20, marginTop:0 }}>{children}</h2>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:BF }}>

      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />

      {successBooking && (
        <BookingSuccessModal
          booking={successBooking}
          listing={listing}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onClose={() => setSuccessBooking(null)}
          onGoToDashboard={() => navigate('/dashboard')}
        />
      )}

      <div style={{ maxWidth:1120, margin:'0 auto', padding:'16px 24px 0', display:'flex', alignItems:'center', gap:6 }}>
        {[{to:'/',label:'Home'},{to:loc.city?`/search?city=${loc.city}`:null,label:loc.city},{to:null,label:listing.title}].filter(x=>x.label).map((c,i,a)=>(
          <React.Fragment key={i}>
            {i>0 && <span style={{color:'#ccc',fontSize:12}}>›</span>}
            {c.to && i<a.length-1
              ? <Link to={c.to} style={{fontSize:13,color:T.sub,textDecoration:'underline',textDecorationColor:'#ddd',textUnderlineOffset:2}}>{c.label}</Link>
              : <span style={{fontSize:13,color:T.text,fontWeight:500}}>{c.label}</span>}
          </React.Fragment>
        ))}
      </div>

      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.35}}
        style={{ maxWidth:1120, margin:'0 auto', padding:'13px 24px 18px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <h1 style={{ fontFamily:HF, fontSize:'clamp(22px,3vw,32px)', fontWeight:700, color:T.text, lineHeight:1.25, margin:0 }}>
          {listing.title}
        </h1>
        <div style={{display:'flex',gap:2,flexShrink:0}}>
          {[
            {icon:<FaShareAlt size={12}/>,label:'Share',fn:()=>navigator.clipboard?.writeText(window.location.href)},
            {icon:<FaHeart size={12} style={{color:wishlisted?T.primary:T.text}}/>,label:wishlisted?'Saved':'Save',fn:()=>setWishlisted(v=>!v)},
          ].map(b=>(
            <button key={b.label} onClick={b.fn}
              style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderRadius:8,border:'none',background:'none',cursor:'pointer',fontFamily:BF,fontSize:13,fontWeight:600,color:T.text,textDecoration:'underline',textDecorationColor:'#ccc',textUnderlineOffset:2 }}
              onMouseOver={e=>e.currentTarget.style.background=T.bgSoft}
              onMouseOut={e=>e.currentTarget.style.background='none'}>
              {b.icon}{b.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 24px', position:'relative' }}>
        <ImageGrid images={images} title={listing.title}/>
      </div>

      <div style={{ maxWidth:1120, margin:'0 auto', padding:'40px 24px 120px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 380px', columnGap:72, alignItems:'start' }}>

          <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.4,delay:.08}}>

            <S>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16 }}>
                <div>
                  <h2 style={{ fontFamily:HF,fontSize:22,fontWeight:600,color:T.text,marginBottom:6,marginTop:0 }}>
                    {propType} hosted by {hName}
                  </h2>
                  <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
                    {[listing.accommodates&&`${listing.accommodates} guest${listing.accommodates>1?'s':''}`,listing.bedrooms&&`${listing.bedrooms} bedroom${listing.bedrooms>1?'s':''}`,listing.beds&&`${listing.beds} bed${listing.beds>1?'s':''}`,listing.bathrooms&&`${listing.bathrooms} bath${listing.bathrooms>1?'s':''}`].filter(Boolean).map((s,i,a)=>(
                      <React.Fragment key={i}><span style={{fontSize:15,color:T.sub}}>{s}</span>{i<a.length-1&&<span style={{color:'#ddd',fontSize:12}}>·</span>}</React.Fragment>
                    ))}
                  </div>
                  {listing.averageRating>0 && (
                    <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:8 }}>
                      <FaStar style={{color:T.primary,fontSize:12}}/>
                      <span style={{fontSize:14,fontWeight:600,color:T.text}}>{listing.averageRating.toFixed(1)}</span>
                      <span style={{color:'#ddd'}}>·</span>
                      <span style={{fontSize:14,color:T.sub,textDecoration:'underline',cursor:'pointer'}}>{listing.totalReviews||reviews.length} review{(listing.totalReviews||reviews.length)!==1?'s':''}</span>
                      {locStr&&<><span style={{color:'#ddd'}}>·</span><span style={{fontSize:14,color:T.sub}}>{locStr}</span></>}
                    </div>
                  )}
                </div>
                <div style={{ width:52,height:52,borderRadius:'50%',overflow:'hidden',flexShrink:0,border:`2px solid ${T.borderLight}`,position:'relative' }}>
                  {hd.profileImage ? <img src={hd.profileImage} alt={hName} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <div style={{width:'100%',height:'100%',background:T.primary,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'#fff',fontWeight:700,fontSize:19}}>{hName[0]?.toUpperCase()}</span></div>}
                  {hd.isSuperhost&&<div style={{position:'absolute',bottom:-2,right:-2,width:17,height:17,background:T.primary,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',border:'2px solid #fff'}}><span style={{color:'#fff',fontSize:7}}>★</span></div>}
                </div>
              </div>
            </S>

            <S>
              <div style={{display:'flex',flexDirection:'column',gap:22}}>
                {[
                  hd.isSuperhost&&{e:'🏅',t:`${hName} is a Superhost`,b:'Superhosts are experienced, highly rated hosts committed to great stays.'},
                  {e:'📍',t:'Great location',b:locStr||'Centrally located with easy access to local attractions.'},
                  {e:'🔑',t:'Self check-in',b:'Check yourself in with the lockbox — no coordination needed.'},
                  (hd.responseRate>=90)&&{e:'💬',t:'Fast responses',b:`${hd.responseRate}% response rate · typically within an hour.`},
                ].filter(Boolean).map((h,i)=>(
                  <div key={i} style={{display:'flex',gap:18}}>
                    <span style={{fontSize:24,flexShrink:0,lineHeight:1}}>{h.e}</span>
                    <div>
                      <p style={{fontFamily:BF,fontWeight:600,fontSize:15,color:T.text,marginBottom:3}}>{h.t}</p>
                      <p style={{fontFamily:BF,fontSize:14,color:T.sub,lineHeight:1.55}}>{h.b}</p>
                    </div>
                  </div>
                ))}
              </div>
            </S>

            <S><p style={{fontSize:16,lineHeight:1.8,color:'#484848',whiteSpace:'pre-line',margin:0}}>{listing.description}</p></S>

            {amenities.length>0 && <S><Title>What this place offers</Title><AmenitiesGrid amenities={amenities}/></S>}

            <S>
              <Title>{nights>0 ? `${nights} night${nights!==1?'s':''} in ${loc.city||'this property'}` : 'Select check-in date'}</Title>
              <p style={{fontSize:14,color:T.sub,marginBottom:20,marginTop:-12}}>
                {checkIn&&checkOut ? `${checkIn.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})} – ${checkOut.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}` : 'Add your travel dates for exact pricing'}
              </p>
              <AirbnbCalendar
                unavailableDates={blocked}
                checkIn={checkIn}
                checkOut={checkOut}
                activeField={checkIn && !checkOut ? 'checkout' : 'checkin'}
                onDatesSelected={({checkIn:ci,checkOut:co})=>{ setCheckIn(ci); setCheckOut(co); }}
              />
            </S>

            <S><Title>Meet your host</Title><HostInfo host={hostObj}/></S>

            <S last><ReviewsSection reviews={reviews} averageRating={listing.averageRating}/></S>

          </motion.div>

          <div style={{ position:'sticky', top:96 }}>
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.18,duration:.4}}
              style={{ background:'#fff', borderRadius:T.radius.card, border:`1px solid ${T.border}`, padding:28, boxShadow:T.shadow.card }}>
              <BookingWidget
                listing={listing} checkIn={checkIn} checkOut={checkOut}
                guests={guests} setGuests={setGuests}
                onBook={handleBook} loading={bLoading}
                onDatesSelected={({checkIn:ci,checkOut:co})=>{ setCheckIn(ci); setCheckOut(co); }}
                unavailableDates={blocked}
              />
            </motion.div>
            <div style={{marginTop:20,textAlign:'center'}}>
              <button style={{fontFamily:BF,fontSize:13,color:T.sub,textDecoration:'underline',textDecorationColor:'#ddd',background:'none',border:'none',cursor:'pointer'}}>Report this listing</button>
            </div>
          </div>

        </div>
      </div>

      <div className="lg:hidden" style={{position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:`1px solid ${T.borderLight}`,padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:100,boxShadow:'0 -4px 20px rgba(0,0,0,.08)'}}>
        <div>
          <span style={{fontFamily:HF,fontSize:18,fontWeight:700,color:T.text}}>${(listing.pricing?.basePrice||0).toLocaleString()}</span>
          <span style={{fontFamily:BF,fontSize:13,color:T.sub}}> /night</span>
          {listing.averageRating>0&&<div style={{display:'flex',alignItems:'center',gap:4,marginTop:2}}><FaStar style={{color:T.primary,fontSize:11}}/><span style={{fontSize:12,fontWeight:600,color:T.text}}>{listing.averageRating.toFixed(1)}</span></div>}
        </div>
        <button onClick={handleBook} style={{padding:'12px 28px',background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`,color:'#fff',fontFamily:BF,fontWeight:700,fontSize:15,border:'none',borderRadius:10,cursor:'pointer',boxShadow:T.shadow.button}}>Reserve</button>
      </div>

    </div>
  );
}