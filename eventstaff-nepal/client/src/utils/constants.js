export const ROLES = [
  'Waiter',
  'Bartender',
  'Chef',
  'Host',
  'Security',
  'DJ',
  'Photographer'
];

export const EXPERIENCE_LEVELS = [
  'None',
  '0-1 years',
  '1-3 years',
  '3-5 years',
  '5+ years'
];

export const EVENT_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

export const APPLICATION_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' }
];

export const KATHMANDU_CENTER = {
  lat: 27.7172,
  lng: 85.3240
};

export const MAP_CONFIG = {
  defaultZoom: 13,
  minZoom: 10,
  maxZoom: 18
};

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 50
};

export const SOCKET_EVENTS = {
  NEW_MESSAGE: 'newMessage',
  MESSAGE_SENT: 'messageSent',
  USER_TYPING: 'userTyping',
  USER_STOPPED_TYPING: 'userStoppedTyping',
  ONLINE_STATUS: 'onlineStatus',
  ONLINE_USERS: 'onlineUsers'
};

export const TOAST_DURATION = 4000;
export const TYPING_TIMEOUT = 3000;