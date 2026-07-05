import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const STATS = [
  { valueKey: 'home.stats_workers_val', labelKey: 'home.stats_workers_label' },
  { valueKey: 'home.stats_events_val', labelKey: 'home.stats_events_label' },
  { valueKey: 'home.stats_venues_val', labelKey: 'home.stats_venues_label' },
  { valueKey: 'home.stats_rating_val', labelKey: 'home.stats_rating_label' },
];

const FEATURES = [
  {
    glyph: '◈',
    titleKey: 'home.feat1_title',
    bodyKey: 'home.feat1_body',
  },
  {
    glyph: '◉',
    titleKey: 'home.feat2_title',
    bodyKey: 'home.feat2_body',
  },
  {
    glyph: '◎',
    titleKey: 'home.feat3_title',
    bodyKey: 'home.feat3_body',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  let cancelled = false;

  useEffect(() => {
    cancelled = false;
    fetchFeaturedEvents();
    return () => { cancelled = true; };
  }, []);

  const getEventDateTime = (event, field) => {
    const d = new Date(event.eventDate);
    const [h, m] = (event[field] || '00:00').split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const getEventState = (event) => {
    const now = new Date();
    const start = getEventDateTime(event, 'startTime');
    const end = getEventDateTime(event, 'endTime');
    if (now >= start && now<= end) return 'Ongoing';
    if (now < start) return 'Upcoming';
    return 'Closed';
  };

  const fetchFeaturedEvents = async () => {
    setEventsLoading(true);
    setFetchError(false);
    try {
      const res = await api.get('/events?status=active');
      if (cancelled) return;
      setFeaturedEvents(res.data.slice(0, 6));
    } catch {
      if (cancelled) return;
      setFetchError(true);
    }
    finally { if (!cancelled) setEventsLoading(false); }
  };

  const ongoing = featuredEvents.filter(e => getEventState(e) === 'Ongoing');
  const upcoming = featuredEvents.filter(e =>getEventState(e) === 'Upcoming');

  return (<div className="min-h-screen">

      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Giant watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(130px, 22vw, 320px)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(232, 104, 30, 0.065)',
              letterSpacing: '0.04em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >{t('common.nepal', 'NEPAL')}</span>
        </div>

        {/* Ambient spot */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 0% 30%, rgba(232,104,30,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 py-32 w-full">
          <div className="animate-fade-in">
            <p className="label mb-8 tracking-[0.3em]">{t('home.label_premier')}</p>

            <h1
              className="font-serif leading-none mb-8"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 6.5rem)' }}
            >
              <span style={{ color: 'var(--text)', fontWeight: 300 }}>{t('home.title').split(' ')[0]} {t('home.title').split(' ')[1] || ''}</span>
              <br />
              <span className="flame-text" style={{ fontWeight: 700, fontStyle: 'italic' }}>{t('home.title').split(' ').slice(2).join(' ')}</span>
            </h1>

            <p
              className="text-lg max-w-xl leading-relaxed mb-12 animate-slide-up"
              style={{ color: 'var(--text-muted)', animationDelay: '0.1s' }}
            >
              {t('home.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {!user ? (
                <>
                  <Link to="/register" className="btn-glass px-8 py-3.5">{t('nav.register')}</Link>
                  <Link to="/events" className="btn-glass px-8 py-3.5">{t('nav.events')}</Link>
                </>) : user.role === 'organizer' ? (<>
                  <Link to="/dashboard" className="btn-glass px-8 py-3.5">{t('nav.dashboard')}</Link>
                  <Link to="/events" className="btn-glass px-8 py-3.5">{t('nav.events')}</Link>
                </>) : (<>
                  <Link to="/worker-dashboard" className="btn-glass px-8 py-3.5">{t('home.find_work')}</Link>
                  <Link to="/events" className="btn-glass px-8 py-3.5">{t('nav.events')}</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Vertical running label */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:block select-none pointer-events-none"
          aria-hidden="true"
        >
          <span
            className="label"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              letterSpacing: '0.25em',
              opacity: 0.4,
              fontSize: '0.6rem',
            }}
          >{t('common.eventstaff_nepal_est_2024', 'EVENTSTAFF NEPAL — EST. 2024')}</span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1s' }}>
          <span className="label" style={{ fontSize: '0.55rem', letterSpacing: '0.25em', opacity: 0.5 }}>{t('home.scroll')}</span>
          <div
            style={{
              width: 1,
              height: 40,
              background: 'linear-gradient(to bottom, var(--flame), transparent)',
              opacity: 0.5,
            }}
          />
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────── */}
      <section className="py-0">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="px-8 py-10 text-center animate-fade-in"
                style={{
                  animationDelay: `${i * 0.07}s`,
                  borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  className="font-serif mb-1.5"
                  style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', color: 'var(--text)', fontWeight: 300 }}
                >
                  {t(s.valueKey)}
                </div>
                <div className="label" style={{ fontSize: '0.6rem', opacity: 0.55, letterSpacing: '0.18em' }}>
                  {t(s.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE EVENTS ─────────────────────────────── */}
      <section className="py-28 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
            <div>
              <p className="label mb-4">{t('home.label_current')}</p>
              <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text)', fontWeight: 400 }}>
                {t('home.live_upcoming')}
              </h2>
            </div>
            <Link to="/events" className="btn-glass px-6 py-2.5 text-xs">
              {t('home.all_events')}
            </Link>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner /></div>) : fetchError ? (<div className="card p-8 text-center">
              <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>{t('common.failed_to_load_events', 'Failed to load events')}</p>
              <button
                onClick={fetchFeaturedEvents}
                className="btn-glass px-6 py-2.5 text-xs"
              >{t('common.try_again', 'Try again')}</button>
            </div>) : (<div className="grid md:grid-cols-2 gap-6">
              {/* Ongoing */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="notification-dot" />
                  <span className="label">{t('home.happening_now')}</span>
                </div>
                {ongoing.length === 0 ? (
                  <p className="text-sm py-8 text-center" style={{ color: 'var(--text-dim)' }}>
                    {t('home.no_live')}
                  </p>) : (<div className="space-y-3">
                    {ongoing.map(event => (
                      <Link
                        key={event._id}
                        to={`/events/${event._id}`}
                        className="event-card event-card--live"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-serif text-lg truncate" style={{ color: 'var(--text)', fontWeight: 400 }}>{event.title}</span>
                          <span className="tag" style={{ flexShrink: 0 }}>{t('common.live', 'Live')}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{event.location}</span>
                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <span>{event.startTime}–{event.endTime}</span>
                          <span>·</span>
                          <span>{event.acceptedCount ?? 0}/{event.totalPositions} staff</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming */}
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--gold)', boxShadow: '0 0 6px rgba(201,168,76,0.5)' }}
                  />
                  <span className="label" style={{ color: 'var(--gold)' }}>{t('home.starting_soon')}</span>
                </div>
                {upcoming.length === 0 ? (
                  <p className="text-sm py-8 text-center" style={{ color: 'var(--text-dim)' }}>
                    {t('home.no_upcoming')}
                  </p>) : (<div className="space-y-3">
                    {upcoming.map(event => (
                      <Link
                        key={event._id}
                        to={`/events/${event._id}`}
                        className="event-card event-card--upcoming"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-serif text-lg truncate" style={{ color: 'var(--text)', fontWeight: 400 }}>{event.title}</span>
                          <span
                            className="tag flex-shrink-0"
                            style={{ background: 'rgba(201,168,76,0.1)', borderColor: 'rgba(201,168,76,0.2)', color: 'var(--gold-light)' }}
                          >{t('common.soon', 'Soon')}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{event.location}</span>
                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          <span>{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>·</span>
                          <span>{event.startTime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="label mb-5">{t('home.label_why')}</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text)', fontWeight: 400 }}>
              {t('home.advantage')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group p-12 transition-colors duration-300"
                style={{ background: 'var(--surface)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <div
                  className="font-serif text-4xl mb-8 transition-colors duration-300"
                  style={{ color: 'rgba(232,104,30,0.35)' }}
                >
                  {f.glyph}
                </div>
                <h3 className="font-serif text-2xl mb-4" style={{ color: 'var(--text)', fontWeight: 500 }}>
                  {t(f.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {t(f.bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="label mb-6">{t('home.label_join')}</p>
          <h2
            className="font-serif mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--text)', fontWeight: 300, lineHeight: 1.1 }}
          >
            {t('home.ready')}
            <br />
            <span className="flame-text" style={{ fontStyle: 'italic', fontWeight: 600 }}>{t('home.your_events')}</span>
          </h2>
          <p className="text-base mb-12 max-w-md mx-auto" style={{ color: 'var(--text-muted)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {t('home.cta_desc')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {!user ? (
              <>
                <Link to="/register" className="btn-glass px-10 py-3.5">{t('nav.register')}</Link>
                <Link to="/login" className="btn-glass px-10 py-3.5">{t('nav.login')}</Link>
              </>) : (<Link to={user.role === 'organizer' ? '/dashboard' : '/worker-dashboard'} className="btn-glass px-10 py-3.5">
                {user.role === 'organizer' ? t('home.view_my_events') : t('home.find_work')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer
        className="py-10 px-6 relative z-10"
        style={{ borderTop: '1px solid var(--border)', background: '#060912', opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span style={{ color: 'var(--flame)', fontSize: '0.85rem' }}>◆</span>
            <span className="font-serif text-lg" style={{ color: 'var(--text)', fontWeight: 400 }}>{t('common.eventstaff', 'EventStaff')}<span style={{ fontStyle: 'italic', color: 'var(--flame)' }}>{t('common.nepal', 'NEPAL')}</span>
            </span>
          </div>
          <nav className="flex items-center gap-6">
            {[[t('footer.about'), '#'], [t('footer.events'), '/events']].map(([label, to]) => (
              <Link
                key={label}
                to={to}
                className="text-xs transition-colors duration-200"
                style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
