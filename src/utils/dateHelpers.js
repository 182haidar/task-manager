// src/utils/dateHelpers.js
export const getFriendlyDeadline = (deadline) => {
  const now = new Date();
  const taskDate = new Date(deadline);
  const diffMs = taskDate - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return `OVERDUE by ${Math.abs(diffHours)} hours`;
  if (diffHours < 24) return `Due in ${diffHours} hours`;

  const diffDays = Math.floor(diffHours / 24);
  return `Due in ${diffDays} days`;
};

export const getUrgencyColor = (deadline) => {
  const today = new Date();
  const taskDate = new Date(deadline);
  const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return '#f44336';   // Red
  if (diffDays <= 2) return '#ff9800';   // Orange
  if (diffDays <= 5) return '#ffeb3b';   // Yellow
  return '#4caf50';                      // Green
};