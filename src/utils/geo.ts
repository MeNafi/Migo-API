export const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const proximityScore = (distanceKm: number, maxKm = 6) => {
  if (distanceKm >= maxKm) return 0;
  return Number((1 - distanceKm / maxKm).toFixed(4));
};

export const minutesFromTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const timeCompatibility = (requested: string, available: string, maxMinutes = 45) => {
  const diff = Math.abs(minutesFromTime(requested) - minutesFromTime(available));
  if (diff >= maxMinutes) return 0;
  return Number((1 - diff / maxMinutes).toFixed(4));
};

export const dayOfWeekFromDate = (date: Date | string) => {
  return new Date(date).getUTCDay();
};

