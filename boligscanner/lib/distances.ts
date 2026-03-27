// Major Danish cities with coordinates (lat, lng)
export const MAJOR_CITIES = [
  { name: 'København', lat: 55.676, lng: 12.568 },
  { name: 'Aarhus', lat: 56.162, lng: 10.203 },
  { name: 'Odense', lat: 55.400, lng: 10.389 },
  { name: 'Aalborg', lat: 57.048, lng: 9.921 },
  { name: 'Esbjerg', lat: 55.472, lng: 8.476 },
  { name: 'Randers', lat: 56.470, lng: 10.024 },
  { name: 'Kolding', lat: 55.492, lng: 9.479 },
  { name: 'Horsens', lat: 55.860, lng: 9.853 },
  { name: 'Vejle', lat: 55.720, lng: 9.542 },
  { name: 'Silkeborg', lat: 56.188, lng: 9.552 },
];

// Calculate distance between two coordinates in km (using simplified formula)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

// Get the 2 closest major cities to a coordinate
export function getClosestMajorCities(lat: number, lng: number, count = 2) {
  return MAJOR_CITIES
    .map(city => ({
      ...city,
      distance: calculateDistance(lat, lng, city.lat, city.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}
