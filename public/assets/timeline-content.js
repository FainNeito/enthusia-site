// This legacy import note is stored in record bodies; remove only the exact trailing note for display.
const IMPORT_NOTE = /(?:\r?\n){1,2}Source verification pending\. Imported from the supplied site content\.$/;

export function timelineDisplayBody(body) {
  return typeof body === 'string' ? body.replace(IMPORT_NOTE, '') : body;
}
