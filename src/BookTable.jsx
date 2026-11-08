// Book a table (Figma 884:326) and Booking confirmed (884:694)
// Gating: nothing is picked for you. Times stay greyed until a date is chosen, and the CTA reads
// "Book" until guests, date and time are all set, then becomes "Book for N · Day, Time".
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { GENTLE, NAVY, MUTED } from './ui.jsx';
import { VIcon } from './venueIcons.jsx';
import { G, CircleBtn, TopBar, Section, ChipGroup, PrimaryCTA, SenseTiles, InfoList, PURPLE, TAP, t } from './flow.jsx';
import { VENUE } from './Venue.jsx';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY = new Date(2026, 10, 8); // Sun Nov 8
export const DATES = Array.from({ length: 10 }, (_, i) => {
  const d = new Date(TODAY); d.setDate(TODAY.getDate() + i);
  const dow = DOW[d.getDay()];
  return {
    i, dow, num: d.getDate(), month: d.toLocaleString('en-US', { month: 'long' }),
    label: i === 0 ? 'Today' : dow,
    short: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dow} ${d.getDate()}`,
    long: `${i === 0 ? 'Today, ' : i === 1 ? 'Tomorrow, ' : ''}${dow} ${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
  };
});

const TIMES = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
// Typical crowd per slot. null = no table (closed or fully booked).
const CROWD = {
  Sun: ['Relaxed', 'Relaxed', 'Buzzing', 'Busy', 'Busy', 'Buzzing', 'Relaxed', 'Almost empty', null],
  Wk: ['Almost empty', 'Relaxed', 'Relaxed', 'Buzzing', 'Buzzing', 'Relaxed', 'Relaxed', 'Almost empty', null],
  Fri: ['Buzzing', 'Busy', 'Busy', 'Packed', null, 'Busy', 'Buzzing', 'Relaxed', 'Relaxed'],
  Sat: ['Busy', 'Busy', 'Packed', null, 'Packed', 'Busy', 'Buzzing', 'Relaxed', 'Relaxed'],
};
export function slotsFor(dateIdx, guests) {
  if (dateIdx == null) return TIMES.map((time) => ({ time, crowd: null, ok: false }));
  const dow = DATES[dateIdx].dow;
  const row = CROWD[dow] || CROWD.Wk;
  return TIMES.map((time, i) => {
    let crowd = row[i];
    if (crowd && guests >= 6 && (crowd === 'Busy' || crowd === 'Packed')) crowd = null; // no big tables at peak
    return { time, crowd, ok: !!crowd };
  });
}

export const SEATS = ['No preference', 'Patio', 'Indoor table', 'Bar seats', 'Quietest spot'];
export const COMFORT = ['Away from speakers', 'Near the exit', 'Step-free access', 'Softer lighting', 'Space for a stroller'];
export const emptyDraft = () => ({ guests: null, date: null, time: null, seat: 'No preference', comfort: [], note: '' });

function useNudge() {
  const c = useAnimationControls();
  return [c, () => c.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.42 } })];
}

export default function BookTable({ draft, setDraft, onClose, onBooked, existing, onCancelBooking }) {
  const [scrolled, setScrolled] = useState(false);
  const [busy, setBusy] = useState(false);
  const scroller = useRef(null);
  const refs = { guests: useRef(null), date: useRef(null), time: useRef(null) };
  const [gC, nudgeG] = useNudge();
  const [dC, nudgeD] = useNudge();
  const [tC, nudgeT] = useNudge();
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const { guests, date, time } = draft;
  const slots = slotsFor(date, guests || 2);
  const ready = guests && date != null && time;
  const d = date != null ? DATES[date] : null;
  const ctaLabel = ready ? `${existing ? 'Update to' : 'Book for'} ${guests} · ${d.short}, ${time}` : 'Book';

  const changeGuests = (n) => {
    const s = slotsFor(date, n);
    const keep = time && s.find((x) => x.time === time)?.ok;
    set({ guests: n, time: keep ? time : null });
  };
  const pickDate = (i) => {
    const s = slotsFor(i, guests || 2);
    const keep = time && s.find((x) => x.time === time)?.ok;
    set({ date: i, time: keep ? time : null });
  };

  const blocked = () => {
    const missing = !guests ? ['guests', nudgeG] : date == null ? ['date', nudgeD] : ['time', nudgeT];
    const el = refs[missing[0]].current, sc = scroller.current;
    if (el && sc) sc.scrollTo({ top: Math.max(0, el.offsetTop - 130), behavior: 'smooth' });
    setTimeout(missing[1], 260);
  };

  const book = () => {
    setBusy(true);
    const slot = slots.find((s) => s.time === time);
    setTimeout(() => {
      setBusy(false);
      onBooked({ guests, date, time, crowd: slot.crowd, seat: draft.seat, comfort: draft.comfort, note: draft.note, dayShort: d.short, dayLong: d.long });
    }, 900);
  };

  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <TopBar title="Book a table" onClose={onClose} scrolled={scrolled} />
      <div ref={scroller} className="scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
        <div style={{ padding: '128px 24px 140px', display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>

          {/* Guests */}
          <motion.div ref={refs.guests} animate={gC}>
            <Section icon="user" title="Guests">
              <G r={30} style={{ padding: '6px 6px 6px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ ...t(15, 500, MUTED), flex: '1 0 0' }}>Party size</span>
                <CircleBtn label="Fewer guests" onClick={() => guests > 1 && changeGuests(guests - 1)}
                  style={{ opacity: !guests || guests <= 1 ? 0.4 : 1, pointerEvents: !guests || guests <= 1 ? 'none' : 'auto' }}>
                  <VIcon name="minus" size={20} />
                </CircleBtn>
                <div style={{ width: 28, textAlign: 'center', overflow: 'hidden', height: 28, position: 'relative' }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={guests ?? 'none'} style={{ display: 'block', ...t(20, 600, guests ? NAVY : 'rgba(42,38,80,0.35)', { lineHeight: '28px' }) }}
                      initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={TAP}>
                      {guests ?? 0}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <motion.button aria-label="More guests" className="gl-solid" whileTap={{ scale: 0.9 }} transition={TAP}
                  onClick={() => changeGuests(Math.min(12, (guests || 0) + 1))}
                  style={{ width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VIcon name="plus20" size={20} />
                </motion.button>
              </G>
              <AnimatePresence initial={false}>
                {guests >= 6 && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={GENTLE}
                    style={{ ...t(13, 400, MUTED), overflow: 'hidden', marginTop: -4, paddingLeft: 4 }}>
                    Bigger tables are limited at busy times, so some times close up.
                  </motion.p>
                )}
              </AnimatePresence>
            </Section>
          </motion.div>

          {/* Date */}
          <motion.div ref={refs.date} animate={dC}>
            <Section icon="cal" title="Date" note={d ? d.month : 'November'}>
              <div className="hscroll" style={{ margin: '-6px -24px -18px', padding: '6px 24px 18px', display: 'flex', gap: 10 }}>
                {DATES.map((x) => {
                  const on = date === x.i;
                  return (
                    <G key={x.i} as="button" r={24} on={on} onClick={() => pickDate(x.i)} whileTap={{ scale: 0.94 }} transition={TAP}
                      style={{ width: 70, height: 76, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <span style={t(13, on ? 600 : 400, on ? NAVY : MUTED)}>{x.label}</span>
                      <span style={t(20, 600)}>{x.num}</span>
                    </G>
                  );
                })}
              </div>
            </Section>
          </motion.div>

          {/* Time */}
          <motion.div ref={refs.time} animate={tC}>
            <Section icon="users" title="Time" note={date == null ? 'Pick a date first' : 'Crowd shown under each time'}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 122px)', gap: 12, justifyContent: 'space-between' }}>
                {slots.map((s, i) => {
                  const on = time === s.time && s.ok;
                  const idle = date == null;
                  return (
                    <G key={s.time} as="button" r={22} on={on} disabled={!s.ok}
                      onClick={() => s.ok && set({ time: s.time })}
                      whileTap={s.ok ? { scale: 0.95 } : undefined}
                      initial={false}
                      animate={{ opacity: s.ok ? 1 : idle ? 0.38 : 0.45 }}
                      transition={{ duration: 0.25, delay: idle ? 0 : i * 0.03 }}
                      style={{ height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: s.ok ? 'pointer' : 'default' }}>
                      <span style={t(15, 600)}>{s.time}</span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span key={`${date}-${s.crowd}`} className="nowrap" style={t(12, 400, MUTED)}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }}>
                          {idle ? '–' : s.crowd || 'Not available'}
                        </motion.span>
                      </AnimatePresence>
                    </G>
                  );
                })}
              </div>
            </Section>
          </motion.div>

          <Section icon="chair" iconSize={24} title="Where to sit" note="Pick one">
            <ChipGroup single options={SEATS} value={draft.seat} onChange={(v) => set({ seat: v })} />
          </Section>

          <Section title="Make it comfortable" note="Optional · pick any">
            <ChipGroup options={COMFORT} value={draft.comfort} onChange={(v) => set({ comfort: v })} />
          </Section>

          <Section icon="note" title="Anything else?" note="Optional">
            <G r={28} style={{ height: 104, padding: '16px 20px' }}>
              <textarea className="field" rows={3} maxLength={200} value={draft.note} onChange={(e) => set({ note: e.target.value })}
                placeholder="Birthday, allergies, a quiet place to sit with a little one…" style={{ height: '100%', resize: 'none' }} />
            </G>
          </Section>

          <Section title="Booking as">
            <G r={28} style={{ padding: '14px 20px 14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: '#E6E6E8' }} />
              <div style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={t(15, 600)}>Your name</span>
                <span style={t(13, 400, MUTED)}>(000) 000-0000</span>
              </div>
              <motion.button whileTap={{ scale: 0.92 }} style={t(14, 500, PURPLE)}>Edit</motion.button>
            </G>
          </Section>

          <p style={t(13, 400, MUTED, { lineHeight: 1.4 })}>Free to cancel up to 2 hours before. Foxy Loxy holds tables for 15 minutes.</p>
          {existing && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={onCancelBooking} style={{ ...t(15, 500, '#b4413c'), alignSelf: 'center', height: 32, marginTop: -16 }}>
              Cancel booking
            </motion.button>
          )}
        </div>
      </div>
      <PrimaryCTA label={ctaLabel} enabled={!!ready} onClick={book} onBlocked={blocked} busy={busy ? 'Booking…' : null} />
    </div>
  );
}

// ---------- Booking confirmed ----------
const SOUND_FOR = { 'Almost empty': 'Quiet', Relaxed: 'Easy to talk', Buzzing: 'Lively', Busy: 'Lively', Packed: 'Loud' };
const mins = (s) => { const [hm, ap] = s.split(' '); let [h, m] = hm.split(':').map(Number); if (ap === 'PM' && h !== 12) h += 12; return h * 60 + m; };
const fmt = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${String(mm).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };

export function BookingConfirmed({ booking, onClose, onChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [added, setAdded] = useState(false);
  const b = booking;
  const seatText = [b.seat === 'No preference' ? 'Any table' : b.seat, ...b.comfort].join(' · ');
  const slots = slotsFor(b.date, b.guests);
  const after = slots.slice(TIMES.indexOf(b.time) + 1).find((s) => s.crowd === 'Busy' || s.crowd === 'Packed');
  const tip = after ? `it gets busier after ${after.time}` : 'it stays calm for the rest of the evening';
  const patio = b.seat === 'Patio' ? ', and patio tables are farthest from the music' : '';
  const light = mins(b.time) <= mins('5:30 PM') ? 'Natural' : 'Warm & cozy';

  const rise = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { ...GENTLE, delay: 0.25 + i * 0.07 } });

  return (
    <div className="abs" style={{ inset: 0, background: '#f7f5f1' }}>
      <TopBar title="Booking confirmed" onClose={onClose} scrolled={scrolled} right={<CircleBtn icon="export" label="Share booking" />} />
      <div className="scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
        <div style={{ padding: '128px 24px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 88, height: 88, marginBottom: 8 }}>
              <motion.div className="abs" style={{ inset: 0, borderRadius: 44, border: `2px solid ${PURPLE}` }}
                initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1.7, opacity: 0 }} transition={{ duration: 1.1, delay: 0.35, ease: 'easeOut' }} />
              <motion.div className="gl-solid abs" style={{ inset: 0, borderRadius: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
                <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.3 }}>
                  <VIcon name="check" size={40} />
                </motion.span>
              </motion.div>
            </div>
            <motion.h2 {...rise(0)} style={t(28, 600, NAVY, { letterSpacing: -0.4 })}>You're booked</motion.h2>
            <motion.p {...rise(1)} style={t(15, 400, MUTED)}>We sent the details to (000) 000-0000</motion.p>
          </div>

          <motion.div {...rise(2)}>
            <InfoList rows={[
              { icon: 'storefront', text: seatText },
              { icon: 'mapPin', text: VENUE.address },
              { icon: 'clock', text: `${b.dayLong} · ${b.time} · ${b.guests} ${b.guests === 1 ? 'guest' : 'guests'}` },
              { icon: 'phone', text: VENUE.phone },
            ]} />
          </motion.div>

          <motion.div {...rise(3)}>
            <Section title={`What to expect at ${b.time}`} note="Usually">
              <SenseTiles sound={SOUND_FOR[b.crowd]} light={light} crowd={b.crowd} seating={b.seat === 'No preference' ? 'Any' : b.seat} />
              <p style={t(13, 400, MUTED, { lineHeight: 1.4 })}>
                Your table is held until {fmt(mins(b.time) + 15)}. Tip: {tip}{patio}.
              </p>
            </Section>
          </motion.div>

          <motion.div {...rise(4)} style={{ display: 'flex', gap: 12 }}>
            <G as="button" r={26} on={added} onClick={() => setAdded(true)} whileTap={{ scale: 0.96 }} transition={TAP}
              style={{ flex: '1 0 0', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={added ? 'y' : 'n'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={TAP} style={{ display: 'flex' }}>
                  <VIcon name={added ? 'check' : 'cal'} size={20} />
                </motion.span>
              </AnimatePresence>
              <span style={t(15, 600)}>{added ? 'Added' : 'Add to calendar'}</span>
            </G>
            <G as="button" r={26} whileTap={{ scale: 0.96 }} transition={TAP}
              style={{ flex: '1 0 0', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <VIcon name="nav" size={20} />
              <span style={t(15, 600)}>Directions</span>
            </G>
          </motion.div>

          <motion.button {...rise(5)} whileTap={{ scale: 0.96 }} onClick={onChange} style={{ ...t(15, 500, PURPLE), alignSelf: 'center', height: 32 }}>
            Change or cancel booking
          </motion.button>

          <motion.button {...rise(6)} className="gl-solid" onClick={onClose} whileTap={{ scale: 0.97 }}
            style={{ height: 56, borderRadius: 28, ...t(17, 600) }}>Done</motion.button>
        </div>
      </div>
    </div>
  );
}
