
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

/**
 * The parts of an address, in order, with repeats removed.
 *
 * A venue with no recorded locality stores the town as `line1`, because
 * `Address.line1` is required and the town is the most specific TRUE thing
 * available — so "Afraha Stadium, Nakuru, Nakuru" comes out of joining the
 * fields naively. The data is honest; it is the rendering that has to notice.
 */
export function addressParts(...values: (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const part = (value ?? '').trim();
    if (part === '') continue;
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(part);
  }
  return out;
}
