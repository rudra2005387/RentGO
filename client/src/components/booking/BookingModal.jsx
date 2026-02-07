import React, { useMemo, useState } from 'react';
import { createBooking, updateBooking, cancelBooking, getBooking } from '../../services/booking.service';

export default function BookingModal({ open, initial = {}, onClose }) {
  const [step, setStep] = useState('form');
  const [houseAccepted, setHouseAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [billing, setBilling] = useState({ address: '', city: '', zip: '', country: '' });
  const [details, setDetails] = useState(initial);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!open) return null;

  function nights() {
    if (!details.checkIn || !details.checkOut) return 0;
    const d1 = new Date(details.checkIn);
    const d2 = new Date(details.checkOut);
    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  const fees = useMemo(() => ({ cleaning: 30, taxesPct: 0.1 }), []);
  const subtotal = nights() * (details.pricePerNight || 0);
  const cleaning = fees.cleaning;
  const taxes = Math.round((subtotal + cleaning) * fees.taxesPct);
  const total = subtotal + cleaning + taxes;

  function canConfirm() {
    if (!houseAccepted) return false;
    if (paymentMethod === 'card') {
      return card.name && card.number && card.expiry && card.cvc;
    }
    return true;
  }

  function handleConfirm() {
    const booking = createBooking({
      listingId: details.listingId,
      checkIn: details.checkIn,
      checkOut: details.checkOut,
      guests: details.guests,
      pricePerNight: details.pricePerNight,
      subtotal,
      cleaning,
      taxes,
      total,
      paymentMethod,
      billing,
    });
    setConfirmedBooking(booking);
    setStep('confirmation');
  }

  function handleModify(updates) {
    if (!confirmedBooking) return;
    const updated = updateBooking(confirmedBooking.ref, updates);
    setConfirmedBooking(updated);
  }

  function handleCancel(reason) {
    if (!confirmedBooking) return;
    const cancelled = cancelBooking(confirmedBooking.ref, reason);
    setConfirmedBooking(cancelled);
    setStep('cancelled');
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded shadow p-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Booking</h3>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>

        {step === 'form' && (
          <div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Check-in</label>
                <input type="date" value={details.checkIn || ''} onChange={e=>setDetails(d=>({...d, checkIn: e.target.value}))} className="w-full border rounded p-2 mt-1" />
              </div>
              <div>
                <label className="text-sm">Check-out</label>
                <input type="date" value={details.checkOut || ''} onChange={e=>setDetails(d=>({...d, checkOut: e.target.value}))} className="w-full border rounded p-2 mt-1" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm">Guests</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setDetails(d=>({...d, guests: Math.max(1,(d.guests||1)-1)}))} className="px-2 py-1 border rounded">-</button>
                <div>{details.guests||1}</div>
                <button onClick={()=>setDetails(d=>({...d, guests: (d.guests||1)+1}))} className="px-2 py-1 border rounded">+</button>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="font-semibold">Payment method</h4>
              <div className="flex gap-2 mt-2">
                <label className="flex items-center gap-2"><input type="radio" name="pm" checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} /> Card</label>
                <label className="flex items-center gap-2"><input type="radio" name="pm" checked={paymentMethod==='paypal'} onChange={()=>setPaymentMethod('paypal')} /> PayPal</label>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <input placeholder="Name on card" value={card.name} onChange={e=>setCard(c=>({...c, name: e.target.value}))} className="w-full border rounded p-2" />
                  <input placeholder="Card number" value={card.number} onChange={e=>setCard(c=>({...c, number: e.target.value}))} className="w-full border rounded p-2" />
                  <div className="flex gap-2">
                    <input placeholder="MM/YY" value={card.expiry} onChange={e=>setCard(c=>({...c, expiry: e.target.value}))} className="flex-1 border rounded p-2" />
                    <input placeholder="CVC" value={card.cvc} onChange={e=>setCard(c=>({...c, cvc: e.target.value}))} className="w-28 border rounded p-2" />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3">
              <h4 className="font-semibold">Billing address</h4>
              <input placeholder="Address" value={billing.address} onChange={e=>setBilling(b=>({...b, address: e.target.value}))} className="w-full border rounded p-2 mt-1" />
              <div className="flex gap-2 mt-2">
                <input placeholder="City" value={billing.city} onChange={e=>setBilling(b=>({...b, city: e.target.value}))} className="flex-1 border rounded p-2" />
                <input placeholder="ZIP" value={billing.zip} onChange={e=>setBilling(b=>({...b, zip: e.target.value}))} className="w-28 border rounded p-2" />
              </div>
              <input placeholder="Country" value={billing.country} onChange={e=>setBilling(b=>({...b, country: e.target.value}))} className="w-full border rounded p-2 mt-2" />
            </div>

            <div className="mt-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={houseAccepted} onChange={e=>setHouseAccepted(e.target.checked)} /> I accept the house rules</label>
            </div>

            <div className="mt-4 border-t pt-3">
              <div className="text-sm">Order summary</div>
              <div className="mt-2 text-sm">
                <div>Nights: {nights()}</div>
                <div>Subtotal: ${subtotal}</div>
                <div>Cleaning: ${cleaning}</div>
                <div>Taxes: ${taxes}</div>
                <div className="font-semibold">Total: ${total}</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button disabled={!canConfirm()} onClick={handleConfirm} className={`px-4 py-2 rounded text-white ${canConfirm() ? 'bg-blue-600' : 'bg-gray-400'}`}>Confirm booking</button>
              <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            </div>
          </div>
        )}

        {step === 'confirmation' && confirmedBooking && (
          <div>
            <h4 className="font-semibold">Booking confirmed</h4>
            <div className="mt-2 text-sm">Reference: <span className="font-mono">{confirmedBooking.ref}</span></div>
            <div className="mt-2 text-sm">Status: {confirmedBooking.status}</div>
            <div className="mt-2 text-sm">Total paid: ${confirmedBooking.total}</div>

            <div className="mt-3 flex gap-2">
              <button onClick={()=>setStep('modify')} className="px-3 py-2 border rounded">Modify</button>
              <button onClick={()=>handleCancel('User requested')} className="px-3 py-2 bg-red-600 text-white rounded">Cancel booking</button>
              <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
            </div>
          </div>
        )}

        {step === 'modify' && confirmedBooking && (
          <div>
            <h4 className="font-semibold">Modify booking</h4>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label>Check-in</label>
                <input type="date" defaultValue={confirmedBooking.checkIn} onChange={e=>handleModify({checkIn: e.target.value})} className="w-full border rounded p-2 mt-1" />
              </div>
              <div>
                <label>Check-out</label>
                <input type="date" defaultValue={confirmedBooking.checkOut} onChange={e=>handleModify({checkOut: e.target.value})} className="w-full border rounded p-2 mt-1" />
              </div>
            </div>
            <div className="mt-3">
              <button onClick={()=>setStep('confirmation')} className="px-3 py-2 border rounded">Done</button>
            </div>
          </div>
        )}

        {step === 'cancelled' && confirmedBooking && (
          <div>
            <h4 className="font-semibold">Booking cancelled</h4>
            <div className="mt-2 text-sm">Reference: <span className="font-mono">{confirmedBooking.ref}</span></div>
            <div className="mt-2 text-sm">Reason: {confirmedBooking.cancelReason}</div>
            <div className="mt-3"><button onClick={onClose} className="px-3 py-2 border rounded">Close</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
