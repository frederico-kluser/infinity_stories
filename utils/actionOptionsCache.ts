import { ActionOption } from '../types';

const OPTIONS_CACHE_KEY = 'storywell_options_cache';

export interface CachedActionOptions {
	lastMessageId: string;
	options: ActionOption[];
}

export const getCachedActionOptions = (storyId: string): CachedActionOptions | null => {
	try {
		const cached = localStorage.getItem(`${OPTIONS_CACHE_KEY}_${storyId}`);
		if (cached) {
			return JSON.parse(cached) as CachedActionOptions;
		}
	} catch (error) {
		console.error('Failed to read options cache:', error);
	}
	return null;
};

export const saveCachedActionOptions = (storyId: string, lastMessageId: string, options: ActionOption[]): void => {
	try {
		const payload: CachedActionOptions = { lastMessageId, options };
		localStorage.setItem(`${OPTIONS_CACHE_KEY}_${storyId}`, JSON.stringify(payload));
	} catch (error) {
		console.error('Failed to save options cache:', error);
	}
};
