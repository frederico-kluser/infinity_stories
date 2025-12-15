import { ChatMessage } from '../types';

/**
 * Sanitizes a message array by removing duplicate IDs while preserving order.
 */
export function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const seenIds = new Set<string>();
  const sanitized: ChatMessage[] = [];

  for (const msg of messages) {
    if (!msg) continue;

    const { id } = msg;
    if (id && seenIds.has(id)) {
      continue;
    }

    if (id) {
      seenIds.add(id);
    }
    sanitized.push(msg);
  }

  const ordered = sanitized.sort((a, b) => {
    if (typeof a.pageNumber === 'number' && typeof b.pageNumber === 'number') {
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber;
      }
    }

    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }

    return a.id.localeCompare(b.id);
  });

  return ordered.map((msg, index) => {
    const targetPage = index + 1;
    if (msg.pageNumber === targetPage) {
      return msg;
    }
    return {
      ...msg,
      pageNumber: targetPage,
    };
  });
}
