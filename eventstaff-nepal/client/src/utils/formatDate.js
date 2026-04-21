// Nepal timezone (UTC+5:45)
const NPT_OFFSET = 5 * 60 + 45;
const NPT_OFFSET_MS = NPT_OFFSET * 60 * 1000;

const toNPT = (date) => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + NPT_OFFSET_MS);
};

export const formatDate = (date, options = {}) => {
  const {
    format = 'short', // 'short', 'long', 'relative'
    locale = 'en-US'
  } = options;

  const nptDate = toNPT(new Date(date));

  if (format === 'relative') {
    const now = toNPT(new Date());
    const diffMs = now - nptDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  const formatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    dateTime: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  };

  return nptDate.toLocaleDateString(locale, formatOptions[format] || formatOptions.short);
};

export const formatTime = (date) => {
  return toNPT(new Date(date)).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDateTime = (date) => {
  const nptDate = toNPT(new Date(date));
  return nptDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const isToday = (date) => {
  const nptDate = toNPT(new Date(date));
  const today = toNPT(new Date());
  return nptDate.toDateString() === today.toDateString();
};

export const isTomorrow = (date) => {
  const nptDate = toNPT(new Date(date));
  const tomorrow = toNPT(new Date(Date.now() + 86400000));
  return nptDate.toDateString() === tomorrow.toDateString();
};

export const getRelativeDay = (date) => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return formatDate(date, { format: 'short' });
};

export const getEventState = (event) => {
  const now = toNPT(new Date());
  const eventDate = toNPT(new Date(event.eventDate));

  const [startHour, startMin] = (event.startTime || '00:00').split(':').map(Number);
  const [endHour, endMin] = (event.endTime || '00:00').split(':').map(Number);

  const start = new Date(eventDate);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(eventDate);
  end.setHours(endHour, endMin, 0, 0);

  if (now >= start && now <= end) return 'Ongoing';
  if (now < start) return 'Upcoming';
  return 'Closed';
};