export function exportToCSV(data, filename, headers) {
  if (!data || data.length === 0) return false;

  const headerRow = headers.map(h => h.label).join(',');
  const rows = data.map(item =>
    headers.map(h => {
      let value = item[h.key];
      if (value === null || value === undefined) value = '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      if (h.transform) value = h.transform(value, item);
      return value;
    }).join(',')
  );

  const csv = [headerRow, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  return true;
}

export function exportApplicationsToCSV(applications) {
  const headers = [
    { key: 'workerName', label: 'Worker Name' },
    { key: 'workerEmail', label: 'Worker Email' },
    { key: 'eventTitle', label: 'Event' },
    { key: 'role', label: 'Role Applied' },
    { key: 'status', label: 'Status' },
    { key: 'appliedDate', label: 'Applied Date', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { key: 'proposedPay', label: 'Proposed Pay (NPR)', transform: (v) => v ? v.toLocaleString() : '' }
  ];

  const data = applications.map(app => ({
    workerName: app.worker?.name || 'N/A',
    workerEmail: app.worker?.email || 'N/A',
    eventTitle: app.event?.title || 'N/A',
    role: app.roleAppliedFor || 'N/A',
    status: app.status || 'N/A',
    appliedDate: app.createdAt,
    proposedPay: app.proposedPay || 0
  }));

  return exportToCSV(data, `applications_${new Date().toISOString().split('T')[0]}`, headers);
}

export function exportEventsToCSV(events) {
  const headers = [
    { key: 'title', label: 'Event Title' },
    { key: 'date', label: 'Date', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'totalPositions', label: 'Total Positions' },
    { key: 'filledPositions', label: 'Filled' },
    { key: 'status', label: 'Status' },
    { key: 'organizer', label: 'Organizer' }
  ];

  const data = events.map(event => ({
    title: event.title || 'N/A',
    date: event.eventDate || event.date,
    time: event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : '',
    location: event.location || 'N/A',
    totalPositions: event.totalPositions || 0,
    filledPositions: event.filledPositions || event.acceptedCount || 0,
    status: event.status || 'N/A',
    organizer: event.organizer?.name || 'N/A'
  }));

  return exportToCSV(data, `events_${new Date().toISOString().split('T')[0]}`, headers);
}

export function exportWorkersToCSV(users) {
  const headers = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'skills', label: 'Skills', transform: (v) => Array.isArray(v) ? v.join('; ') : v || '' },
    { key: 'experience', label: 'Experience' },
    { key: 'rating', label: 'Rating', transform: (v) => v ? v.toFixed(1) : 'N/A' },
    { key: 'totalReviews', label: 'Total Reviews' },
    { key: 'isVerified', label: 'Verified', transform: (v) => v ? 'Yes' : 'No' },
    { key: 'joinedDate', label: 'Joined', transform: (v) => v ? new Date(v).toLocaleDateString() : '' }
  ];

  const data = users.filter(u => u.role === 'worker').map(user => ({
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    role: user.role || 'N/A',
    skills: user.skills || [],
    experience: user.experience || 'N/A',
    rating: user.rating || 0,
    totalReviews: user.totalReviews || 0,
    isVerified: user.isVerified || false,
    joinedDate: user.createdAt
  }));

  return exportToCSV(data, `workers_${new Date().toISOString().split('T')[0]}`, headers);
}