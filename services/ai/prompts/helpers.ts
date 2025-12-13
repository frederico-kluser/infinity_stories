/**
 * @fileoverview Prompt Helpers - Utility Functions for Prompt Construction
 *
 * This module re-exports inventory formatting functions and provides
 * additional helpers specific to prompt construction.
 *
 * @module prompts/helpers
 */

import { ChatMessage } from '../../../types';

// Re-export inventory formatting functions
export {
  formatInventoryForPrompt,
  formatInventorySimple,
  formatNPCsForPrompt,
  formatStatsForPrompt,
  formatItem,
  normalizeInventory,
} from '../../../utils/inventory';

// Re-export economy formatting functions
export {
  formatEconomyRulesForPrompt,
  formatPriceRangesForPrompt,
  getEconomyRulesForGMPrompt,
  getItemAwarenessRulesForPrompt,
  calculateSellPrice,
} from '../../../constants/economy';

export const DEFAULT_RECENT_MESSAGES = 100;

export function getRecentMessagesForPrompt(
  messages: ChatMessage[],
  limit: number = DEFAULT_RECENT_MESSAGES,
): ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  return messages.slice(-Math.max(1, limit));
}
