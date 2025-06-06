import { Document } from '@langchain/core/documents';
import path from 'path';

/**
 * Formaterar ett enskilt dokument som XML (används för prompt-kontexten).
 */
export function formatDoc(doc: Document): string {
  const metadata = doc.metadata || {};
  const meta = Object.entries(metadata)
    .map(([k, v]) => ` ${k}=${v}`)
    .join('');
  const metaStr = meta ? ` ${meta}` : '';
  return `<document${metaStr}>\n${doc.pageContent}\n</document>`;
}

/**
 * Formaterar en lista av dokument till XML-format för prompten.
 */
export function formatDocs(docs?: Document[]): string {
  if (!docs || docs.length === 0) {
    return '<documents></documents>';
  }
  const formatted = docs.map(formatDoc).join('\n');
  return `<documents>\n${formatted}\n</documents>`;
}

/**
 * FIXAD funktion: Använder metadata.loc.pageNumber istället för metadata.page.
 */
export function formatCitations(sourceDocs?: Document[]): string {
  if (!sourceDocs || sourceDocs.length === 0) {
    return '';
  }

  const citations = sourceDocs.map(doc => {
    const metadata = doc.metadata as Record<string, any>;


    // FI    // Sidnummer: försök loc.pageNumber, page eller pageNumber
    const pageNumber =
      metadata.loc?.pageNumber ??
      metadata.page ??
      metadata.pageNumber ??
      'N/A';

    // Filnamn: originalName om den finns, annars basename av source
    const fileName =
      metadata.originalName ??
      (metadata.source ? path.basename(metadata.source as string) : 'okänt_dokument.pdf');

    return `(${fileName}, sida ${pageNumber})`;
  });

    return citations.join(', ');
  }
