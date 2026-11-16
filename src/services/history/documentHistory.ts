// Document Suite Local History & Drafts Store (100% Offline Indexed / LocalStorage)

export interface DocumentHistoryItem {
  id: string;
  service: 'ticket' | 'prescription' | 'invoice' | 'certificate' | 'idcard';
  title: string;
  subtitle: string;
  badge?: string;
  createdAt: string;
  data: any;
}

const STORAGE_KEY_PREFIX = 'easypad_history_';
const MAX_HISTORY_PER_SERVICE = 30;

export function getDocumentHistory(service?: string): DocumentHistoryItem[] {
  try {
    const key = service ? `${STORAGE_KEY_PREFIX}${service}` : `${STORAGE_KEY_PREFIX}all`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const items = JSON.parse(stored);
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.error('Failed to load document history:', err);
    return [];
  }
}

export function saveDocumentHistory(
  payload: Omit<DocumentHistoryItem, 'id' | 'createdAt'>
): DocumentHistoryItem {
  const item: DocumentHistoryItem = {
    ...payload,
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    // 1. Save to service-specific list
    const serviceKey = `${STORAGE_KEY_PREFIX}${item.service}`;
    const serviceList = getDocumentHistory(item.service);
    const updatedServiceList = [item, ...serviceList.filter(x => x.title !== item.title || x.subtitle !== item.subtitle)].slice(0, MAX_HISTORY_PER_SERVICE);
    localStorage.setItem(serviceKey, JSON.stringify(updatedServiceList));

    // 2. Save to global list
    const allKey = `${STORAGE_KEY_PREFIX}all`;
    const allList = getDocumentHistory();
    const updatedAllList = [item, ...allList.filter(x => x.id !== item.id)].slice(0, 50);
    localStorage.setItem(allKey, JSON.stringify(updatedAllList));
  } catch (err) {
    console.warn('LocalStorage quota or write error saving history:', err);
  }

  return item;
}

export function deleteDocumentHistoryItem(service: string, id: string): void {
  try {
    const serviceKey = `${STORAGE_KEY_PREFIX}${service}`;
    const list = getDocumentHistory(service).filter(x => x.id !== id);
    localStorage.setItem(serviceKey, JSON.stringify(list));

    const allKey = `${STORAGE_KEY_PREFIX}all`;
    const allList = getDocumentHistory().filter(x => x.id !== id);
    localStorage.setItem(allKey, JSON.stringify(allList));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
}

export function clearDocumentHistory(service: string): void {
  try {
    const serviceKey = `${STORAGE_KEY_PREFIX}${service}`;
    localStorage.removeItem(serviceKey);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
