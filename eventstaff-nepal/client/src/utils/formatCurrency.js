export const formatCurrency = (amount, currency = 'NPR') => {
  if (amount === null || amount === undefined) return '';

  const num = Number(amount);
  if (isNaN(num)) return '';

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);

  return `${currency} ${formatted}`;
};

export const formatCurrencyRange = (min, max, currency = 'NPR') => {
  if (min === max) return formatCurrency(min, currency);
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};

export const formatPayRate = (amount, period = 'hr') => {
  return `${formatCurrency(amount)}/${period}`;
};

export const calculateEarnings = (events) => {
  return events.reduce((total, event) => {
    const eventTotal = (event.rolesNeeded || []).reduce((sum, role) => {
      return sum + (role.payPerHour * role.count);
    }, 0);
    return total + eventTotal;
  }, 0);
};

export default formatCurrency;