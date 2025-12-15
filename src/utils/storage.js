import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Wrapper for SecureStore that falls back to localStorage on Web/Tauri.
 * Note: localStorage is NOT secure storage. On a real Desktop deployment,
 * you should use Tauri's safe storage plugins or OS Keyring.
 */

export const setItemAsync = async (key, value, options) => {
	if (isWeb) {
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			console.error('Local storage set error', e);
		}
		return Promise.resolve();
	}
	return SecureStore.setItemAsync(key, value, options);
};

export const getItemAsync = async (key, options) => {
	if (isWeb) {
		try {
			const value = localStorage.getItem(key);
			return Promise.resolve(value);
		} catch (e) {
			console.error('Local storage get error', e);
			return Promise.resolve(null);
		}
	}
	return SecureStore.getItemAsync(key, options);
};

export const deleteItemAsync = async (key, options) => {
	if (isWeb) {
		try {
			localStorage.removeItem(key);
		} catch (e) {
			console.error('Local storage delete error', e);
		}
		return Promise.resolve();
	}
	return SecureStore.deleteItemAsync(key, options);
};

export const clearStoreAsync = async () => {
	if (isWeb) {
		try {
			localStorage.clear();
		} catch (e) {
			console.error('Local storage clear error', e);
		}
		return Promise.resolve();
	}
	// SecureStore doesn't have a clearAll, so we rely on individual deletes or manual cleanup
	return Promise.resolve();
};
