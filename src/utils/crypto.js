import CryptoJS from 'crypto-js';

/**
 * Encrypts data using AES.
 * @param {string} data - The data to encrypt.
 * @param {string} key - The encryption key.
 * @returns {string} The encrypted data (ciphertext).
 */
export const encryptData = (data, key) => {
	return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypts data using AES.
 * @param {string} ciphertext - The encrypted data.
 * @param {string} key - The encryption key.
 * @returns {string} The decrypted data (plaintext).
 * @throws {Error} If decryption fails (e.g., wrong key).
 */
export const decryptData = (ciphertext, key) => {
	const bytes = CryptoJS.AES.decrypt(ciphertext, key);
	const originalText = bytes.toString(CryptoJS.enc.Utf8);
	if (!originalText) {
		throw new Error('Decryption failed');
	}
	return originalText;
};

/**
 * Hashes a password using SHA256.
 * @param {string} password - The password to hash.
 * @returns {string} The hashed password.
 */
export const hashPassword = (password) => {
	return CryptoJS.SHA256(password).toString();
};
