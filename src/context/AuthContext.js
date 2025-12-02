import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { encryptData, decryptData, hashPassword } from '../utils/crypto';

export const AuthContext = createContext();

const KEY_ENCRYPTED_MASTER_PASS = 'encrypted_master_pass';
const KEY_ACCESS_PASS_HASH = 'access_pass_hash';

export const AuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [masterKey, setMasterKey] = useState(null);
	const [isSetup, setIsSetup] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		checkSetup();
	}, []);

	const checkSetup = async () => {
		console.log('AuthContext: Checking setup...');
		try {
			const hash = await SecureStore.getItemAsync(KEY_ACCESS_PASS_HASH);
			if (hash) {
				setIsSetup(true);
			}
		} catch (e) {
			console.error('Failed to check setup', e);
		} finally {
			setLoading(false);
		}
	};

	const setup = async (masterPassword, accessPassword) => {
		try {
			const encryptedMasterKey = encryptData(masterPassword, accessPassword);
			const accessHash = hashPassword(accessPassword);

			await SecureStore.setItemAsync(KEY_ENCRYPTED_MASTER_PASS, encryptedMasterKey);
			await SecureStore.setItemAsync(KEY_ACCESS_PASS_HASH, accessHash);

			setMasterKey(masterPassword);
			setIsAuthenticated(true);
			setIsSetup(true);
		} catch (e) {
			console.error('Setup failed', e);
			throw e;
		}
	};

	const login = async (accessPassword) => {
		try {
			const storedHash = await SecureStore.getItemAsync(KEY_ACCESS_PASS_HASH);
			const inputHash = hashPassword(accessPassword);

			if (storedHash !== inputHash) {
				throw new Error('Invalid Access Password');
			}

			const encryptedMasterKey = await SecureStore.getItemAsync(KEY_ENCRYPTED_MASTER_PASS);
			if (!encryptedMasterKey) {
				throw new Error('Master Key not found');
			}

			const decryptedMasterKey = decryptData(encryptedMasterKey, accessPassword);
			setMasterKey(decryptedMasterKey);
			setIsAuthenticated(true);
		} catch (e) {
			console.error('Login failed', e);
			throw e;
		}
	};

	const logout = () => {
		setMasterKey(null);
		setIsAuthenticated(false);
	};

	const changeAccessPassword = async (oldPassword, newPassword) => {
		try {
			const storedHash = await SecureStore.getItemAsync(KEY_ACCESS_PASS_HASH);
			const inputHash = hashPassword(oldPassword);

			if (storedHash !== inputHash) {
				throw new Error('Incorrect old password');
			}

			// Re-encrypt master key with new password
			const encryptedMasterKey = await SecureStore.getItemAsync(KEY_ENCRYPTED_MASTER_PASS);
			const currentMasterKey = decryptData(encryptedMasterKey, oldPassword);

			const newEncryptedMasterKey = encryptData(currentMasterKey, newPassword);
			const newAccessHash = hashPassword(newPassword);

			await SecureStore.setItemAsync(KEY_ENCRYPTED_MASTER_PASS, newEncryptedMasterKey);
			await SecureStore.setItemAsync(KEY_ACCESS_PASS_HASH, newAccessHash);

			return true;
		} catch (e) {
			console.error('Change password failed', e);
			throw e;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				isSetup,
				loading,
				setup,
				login,
				logout,
				changeAccessPassword,
				masterKey,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
