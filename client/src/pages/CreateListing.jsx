import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProgressIndicator,
  Step1PropertyType,
  Step2Photos,
  Step3Details,
  Step4Amenities,
  Step5Pricing,
  Step6Availability,
  Step7Review
} from '../components/createListing';

const STORAGE_KEY = 'rg_listing_draft';
const AUTO_SAVE_INTERVAL = 5000;

const P = '#FF385C';
const PD = '#E31C5F';
const HF = "'Fraunces', Georgia, serif";
const BF = "'DM Sans', system-ui, sans-serif";

let _fonts = false;
function loadFonts() {
  if (_fonts || typeof document === 'undefined') return;
  _fonts = true;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(l);
}

const STEP_META = [
  { label: 'Property Type', icon: '🏠', short: 'Type' },
  { label: 'Photos',        icon: '📸', short: 'Photos' },
  { label: 'Details',       icon: '📋', short: 'Details' },
  { label: 'Amenities',     icon: '✨', short: 'Amenities' },
  { label: 'Pricing',       icon: '💰', short: 'Pricing' },
  { label: 'Availability',  icon: '📅', short: 'Availability' },
  { label: 'Review',        icon: '🚀', short: 'Publish' },
];

export default function CreateListing() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '', title: '', location: '', description: '',
    photos: [], bedrooms: 1, bathrooms: 1, guests: 2, squareFeet: '',
    buildingType: '', amenities: [], additionalAmenities: '',
    pricePerNight: '', cleaningFee: '', serviceFeePercent: '',
    securityDeposit: '', weeklyDiscount: '', monthlyDiscount: '',
    blockedDates: [], minStayNights: 1, checkInTime: '14:00',
    checkOutTime: '11:00', rules: '',
  });

  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => { loadFonts(); }, []);

  const autoSaveDraft = useCallback(() => {
    try {
      setIsSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...formData, lastSavedAt: new Date().toISOString() }));
      setLastSaved(new Date());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch { setSaveStatus('error'); }
    finally { setIsSaving(false); }
  }, [formData]);

  useEffect(() => {
    const interval = setInterval(autoSaveDraft, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [autoSaveDraft]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData(data);
        setLastSaved(new Date(data.lastSavedAt));
      } catch { /* ignore */ }
    }
  }, []);

  const handleInputChange = (newData) => {
    setFormData(newData);
    setSaveStatus('idle');
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 7) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (finalData) => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Listing submitted:', finalData);
    alert('Listing published successfully!');
  };

  const getTimeString = (date) => {
    if (!date) return null;
    const diff = Date.now() - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const validations = [
    formData.propertyType && formData.title && formData.location,
    true,
    formData.bedrooms >= 1 && formData.bathrooms >= 1,
    true,
    !!formData.pricePerNight,
    true,
    true,
  ];
  const canGoNext = validations[currentStep - 1];
  const completedSteps = validations.map((v, i) => v && i < currentStep - 1);
  const progress = ((currentStep - 1) / 6) * 100;

  const renderStep = () => {
    const props = { data: formData, onChange: handleInputChange };
    const steps = [Step1PropertyType, Step2Photos, Step3Details, Step4Amenities, Step5Pricing, Step6Availability, Step7Review];
    const StepComp = steps[currentStep - 1];
    return StepComp ? <StepComp {...props} {...(currentStep === 7 ? { onSubmit: handleSubmit } : {})} /> : null;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', fontFamily: BF }}>
      <style>{`* { box-sizing: border-box; } input, textarea, select { font-family: '${BF}'; }`}</style>

      {/* ── Top Nav ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0F0F0',
        boxShadow: '0 1px 0 rgba(0,0,0,.04)',
      }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontFamily: HF, fontSize: 22, fontWeight: 700, color: P, textDecoration: 'none' }}>RentGo</Link>

          {/* Progress bar */}
          <div style={{ flex: 1, maxWidth: 320, margin: '0 32px', position: 'relative' }}>
            <div style={{ height: 4, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: `linear-gradient(90deg, ${P}, ${PD})`, borderRadius: 99 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p style={{ fontFamily: BF, fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 5 }}>
              Step {currentStep} of 7 · {STEP_META[currentStep - 1].label}
            </p>
          </div>

          {/* Save status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {saveStatus === 'saved' && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontFamily: BF, fontSize: 12, fontWeight: 600, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                ✓ Saved
              </motion.span>
            )}
            {lastSaved && saveStatus !== 'saved' && (
              <span style={{ fontFamily: BF, fontSize: 11, color: '#bbb' }}>Saved {getTimeString(lastSaved)}</span>
            )}
            <button
              onClick={() => setShowExitModal(true)}
              style={{ fontFamily: BF, fontSize: 13, fontWeight: 600, color: '#555', background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', transition: 'all .15s' }}
              onMouseOver={e => { e.currentTarget.style.color = '#111'; e.currentTarget.style.borderColor = '#ccc'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              Save & exit
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 24px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32, alignItems: 'start' }}>

        {/* ── Sidebar Steps ── */}
        <div style={{ position: 'sticky', top: 96 }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #F0F0F0', boxShadow: '0 2px 12px rgba(0,0,0,.05)', overflow: 'hidden' }}>
            {STEP_META.map((step, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isDone = completedSteps[i];
              const isAccessible = validations.slice(0, i).every(Boolean);
              return (
                <button
                  key={i}
                  onClick={() => isAccessible && goToStep(stepNum)}
                  disabled={!isAccessible}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', background: isActive ? '#FFF1F2' : 'transparent',
                    border: 'none', cursor: isAccessible ? 'pointer' : 'not-allowed',
                    borderLeft: isActive ? `3px solid ${P}` : '3px solid transparent',
                    borderBottom: i < 6 ? '1px solid #F7F7F7' : 'none',
                    transition: 'all .15s', textAlign: 'left',
                  }}
                  onMouseOver={e => { if (isAccessible && !isActive) e.currentTarget.style.background = '#FAFAFA'; }}
                  onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? P : isDone ? '#DCFCE7' : '#F3F4F6',
                    fontSize: isDone ? 14 : 16,
                    transition: 'all .2s',
                  }}>
                    {isDone ? '✓' : isActive ? <span style={{ color: '#fff', fontSize: 14 }}>{step.icon}</span> : <span style={{ fontSize: 14, opacity: isAccessible ? 1 : 0.4 }}>{step.icon}</span>}
                  </div>
                  <div>
                    <p style={{
                      fontFamily: BF, fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? P : isAccessible ? '#333' : '#bbb',
                    }}>
                      {step.label}
                    </p>
                    <p style={{ fontFamily: BF, fontSize: 10, color: '#aaa' }}>Step {stepNum}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Clear draft */}
          <button
            onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }}
            style={{ marginTop: 12, width: '100%', fontFamily: BF, fontSize: 11, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '6px 0' }}
          >
            Clear draft & start over
          </button>
        </div>

        {/* ── Main Content ── */}
        <div>
          {/* Step header */}
          <motion.div
            key={`header-${currentStep}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ marginBottom: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 36 }}>{STEP_META[currentStep - 1].icon}</span>
              <div>
                <p style={{ fontFamily: BF, fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Step {currentStep} of 7
                </p>
                <h1 style={{ fontFamily: HF, fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>
                  {STEP_META[currentStep - 1].label}
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Step content card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#fff', borderRadius: 24, border: '1px solid #F0F0F0',
                boxShadow: '0 2px 16px rgba(0,0,0,.06)', padding: '32px 28px',
                marginBottom: 16,
              }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Validation warning */}
          <AnimatePresence>
            {!canGoNext && currentStep < 7 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#FFFBEB', border: '1px solid #FDE68A',
                  borderRadius: 14, padding: '14px 18px', marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                <p style={{ fontFamily: BF, fontSize: 13, color: '#A16207', fontWeight: 500 }}>
                  Please fill in the required fields to continue to the next step.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <button
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 1}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '13px 22px', borderRadius: 14, border: '1.5px solid #E5E7EB',
                background: '#fff', fontFamily: BF, fontWeight: 600, fontSize: 14, color: '#555',
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 1 ? 0.4 : 1, transition: 'all .15s',
              }}
              onMouseOver={e => { if (currentStep > 1) { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#111'; }}}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#555'; }}
            >
              ← Previous
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={autoSaveDraft}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '13px 20px', borderRadius: 14, border: '1.5px solid #E5E7EB',
                  background: '#fff', fontFamily: BF, fontWeight: 600, fontSize: 13, color: '#555',
                  cursor: 'pointer', transition: 'all .15s', opacity: isSaving ? .6 : 1,
                }}
              >
                {isSaving ? '💾 Saving...' : '💾 Save draft'}
              </button>

              {currentStep < 7 ? (
                <button
                  onClick={() => goToStep(currentStep + 1)}
                  disabled={!canGoNext}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '13px 28px', borderRadius: 14, border: 'none',
                    background: canGoNext ? `linear-gradient(135deg, ${P}, ${PD})` : '#E5E7EB',
                    color: canGoNext ? '#fff' : '#9CA3AF',
                    fontFamily: BF, fontWeight: 700, fontSize: 14,
                    cursor: canGoNext ? 'pointer' : 'not-allowed',
                    boxShadow: canGoNext ? '0 4px 16px rgba(255,56,92,.3)' : 'none',
                    transition: 'all .15s',
                  }}
                  onMouseOver={e => { if (canGoNext) e.currentTarget.style.opacity = '.9'; }}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                >
                  Next step →
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* ── Save & Exit Modal ── */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(4px)' }}
            onClick={() => setShowExitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: .92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: .92 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', maxWidth: 420, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,.2)', fontFamily: BF, textAlign: 'center' }}
            >
              <p style={{ fontSize: 44, marginBottom: 16 }}>💾</p>
              <h3 style={{ fontFamily: HF, fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Save your progress?</h3>
              <p style={{ fontSize: 14, color: '#888', marginBottom: 28, lineHeight: 1.6 }}>
                Your listing draft will be saved and you can continue later.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { autoSaveDraft(); setShowExitModal(false); }}
                  style={{ padding: '14px', background: `linear-gradient(135deg, ${P}, ${PD})`, color: '#fff', fontFamily: BF, fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,56,92,.3)' }}
                >
                  Save draft & exit
                </button>
                <Link
                  to="/dashboard"
                  style={{ padding: '13px', background: '#F3F4F6', color: '#555', fontFamily: BF, fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 12, cursor: 'pointer', textDecoration: 'none', display: 'block' }}
                >
                  Exit without saving
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}