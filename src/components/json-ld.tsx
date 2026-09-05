import type { JsonLd } from '@/lib/seo/jsonld';

/**
 * Structured data, emitted as `application/ld+json`.
 *
 * `JSON.stringify` output is escaped for `<` so a stray closing tag inside a
 * document field cannot break out of the script element. The data itself is
 * organiser-supplied text from Firestore, so this is not optional.
 */
export function JsonLdScript({ data, id }: { data: JsonLd | JsonLd[]; id?: string }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      id={id}
      type="application/ld+json"
      // The only safe way to emit a JSON-LD block: the payload is
      // JSON.stringify output with `<` escaped, never interpolated markup.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
