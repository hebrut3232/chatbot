import { Document } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Reduces the document array based on the provided new documents or actions.
 *
 * @param existing - The existing array of documents.
 * @param newDocs - The new documents or actions to apply.
 * @returns The updated array of documents.
 */
export function reduceDocs(
  existing?: Document[],
  newDocs?:
    | Document[]
    | { [key: string]: any }[]
    | string[]
    | string
    | 'delete',
): Document[] {
  if (newDocs === 'delete') {
    return [];
  }

  const existingList = existing || [];
  const existingIds = new Set(existingList.map((doc) => doc.metadata?.uuid));

  if (typeof newDocs === 'string') {
    const docId = uuidv4();
    return [
      ...existingList,
      { pageContent: newDocs, metadata: { uuid: docId } },
    ];
  }

  const newList: Document[] = [];
  if (Array.isArray(newDocs)) {
    for (const item of newDocs) {
      if (typeof item === 'string') {
        const itemId = uuidv4();
        newList.push({ pageContent: item, metadata: { uuid: itemId } });
        // --- Logga dokumentet som läggs till ---
        console.log('NEW DOCUMENT CREATED (string):', newList[newList.length - 1]);
        existingIds.add(itemId);
      } else if (typeof item === 'object') {
        const metadata = (item as Document).metadata ?? {};
        const itemId = metadata.uuid ?? uuidv4();

        // Alltid sätt source och page om de finns, annars 'N/A'
        let source =
          metadata.source && metadata.source.includes('.pdf')
            ? metadata.source
            : metadata.originalName ?? (metadata.filePath ? path.basename(metadata.filePath) : metadata.source ?? 'N/A');

        let page =
          metadata.loc?.pageNumber ??
          metadata.page ??
          (item as any).page ??
          'N/A';

        if (!existingIds.has(itemId)) {
          if ('pageContent' in item) {
            // It's a Document-like object
                        const outMetadata = { ...metadata, source, page } as Record<string, any>;
            if (metadata.uuid) {
              outMetadata.uuid = metadata.uuid;
            }
newList.push({
  ...(item as Document),
  metadata: {
    ...metadata,
    uuid: itemId,
    source,
    page,                    // behåller ev. befintlig struktur
    loc: {                   // ny, så frontend hittar sidnumret
      pageNumber: page,
    },
  },
});
            // --- Logga dokumentet som läggs till ---
            console.log('NEW DOCUMENT CREATED (object):', newList[newList.length - 1]);
          } else {
// It's a generic object, treat it as metadata
newList.push({
  pageContent: '',
  metadata: {
    ...(item as { [key: string]: any }),
    uuid: itemId,
    source,
    page,                 // behåller ev. befintlig struktur
    loc: {                // nytt fält som frontend letar efter
      pageNumber: page,
    },
  },
});
            // --- Logga dokumentet som läggs till ---
            console.log('NEW DOCUMENT CREATED (generic object):', newList[newList.length - 1]);
          }
          existingIds.add(itemId);
        }
      }
    }
  }

  return [...existingList, ...newList];
}
