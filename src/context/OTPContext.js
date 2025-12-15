import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from '../utils/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './AuthContext';
import { encryptData, decryptData } from '../utils/crypto';

export const OTPContext = createContext();

const KEY_ENCRYPTED_OTP_DATA = 'encrypted_otp_data';

export const OTPProvider = ({ children }) => {
	const { masterKey, isAuthenticated } = useContext(AuthContext);
	const [secrets, setSecrets] = useState([]);

	useEffect(() => {
		if (isAuthenticated && masterKey) {
			loadSecrets();
		} else {
			setSecrets([]);
		}
	}, [isAuthenticated, masterKey]);

	const loadSecrets = async () => {
		try {
			const encryptedData = await SecureStore.getItemAsync(KEY_ENCRYPTED_OTP_DATA);
			if (encryptedData) {
				const decryptedJson = decryptData(encryptedData, masterKey);
				setSecrets(JSON.parse(decryptedJson));
			}
		} catch (e) {
			console.error('Failed to load secrets', e);
		}
	};

	const saveSecrets = async (newSecrets) => {
		try {
			const json = JSON.stringify(newSecrets);
			const encryptedData = encryptData(json, masterKey);
			await SecureStore.setItemAsync(KEY_ENCRYPTED_OTP_DATA, encryptedData);
			setSecrets(newSecrets);
		} catch (e) {
			console.error('Failed to save secrets', e);
			throw e;
		}
	};

	const addSecret = async (name, secret, issuer = '') => {
		const newSecret = {
			id: uuidv4(),
			name,
			secret,
			issuer,
			createdAt: Date.now(),
		};
		const newSecrets = [...secrets, newSecret];
		await saveSecrets(newSecrets);
	};

	const removeSecret = async (id) => {
		const newSecrets = secrets.filter((s) => s.id !== id);
		await saveSecrets(newSecrets);
	};

	const updateSecret = async (id, newData) => {
		const newSecrets = secrets.map((s) => {
			if (s.id === id) {
				return { ...s, ...newData };
			}
			return s;
		});
		await saveSecrets(newSecrets);
	};

	return (
		<OTPContext.Provider value={{ secrets, addSecret, removeSecret, updateSecret, saveSecrets }}>
			{children}
		</OTPContext.Provider>
	);
};
