export const getTimeAgo = dateString => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    yr: 31536000,
    mo: 2592000,
    wk: 604800,
    d: 86400,
    h: 3600,
    min: 60,
  };

  if (seconds < 60) return 'Just now';

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count}${unit}`;
    }
  }
};
