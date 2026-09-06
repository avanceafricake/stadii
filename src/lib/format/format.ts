
/**
 * "Nairobi, Nairobi" is not a place — it is a city that shares its county's
 * name, printed twice.
 *
 * Kenya has a dozen of these: Nakuru, Kisii, Kisumu, Mombasa, Bomet. Repeating
 * the word tells a reader nothing and looks like a bug, so the county is shown
 * only when it adds something the city has not already said.
 */
export function placeLine(city?: string, county?: string): string {
  const town = (city ?? '').trim();
  const region = (county ?? '').trim();

  if (town === '') return region;
  if (region === '' || region.toLowerCase() === town.toLowerCase()) return town;
  return `${town}, ${region}`;
}
