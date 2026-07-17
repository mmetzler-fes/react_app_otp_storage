import React, { useState, useContext } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ChangePasswordScreen({ navigation }) {
	const { changeAccessPassword, resetPasswordViaBiometrics, isBiometricSupported } =
		useContext(AuthContext);

	// 'classic' = old password required | 'biometric' = fingerprint instead
	const [mode, setMode] = useState('classic');
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const validateNewPasswords = () => {
		if (!newPassword || !confirmPassword) {
			Alert.alert('Fehler', 'Bitte alle Felder ausfüllen.');
			return false;
		}
		if (newPassword !== confirmPassword) {
			Alert.alert('Fehler', 'Die neuen Passwörter stimmen nicht überein.');
			return false;
		}
		if (newPassword.length < 4) {
			Alert.alert('Fehler', 'Das neue Passwort muss mindestens 4 Zeichen lang sein.');
			return false;
		}
		return true;
	};

	const handleClassicChange = async () => {
		if (!oldPassword) {
			Alert.alert('Fehler', 'Bitte das alte Passwort eingeben.');
			return;
		}
		if (!validateNewPasswords()) return;

		setLoading(true);
		try {
			await changeAccessPassword(oldPassword, newPassword);
			Alert.alert(
				'Erfolg',
				'Passwort wurde geändert.\n\nHinweis: Der Fingerabdruck-Login wurde deaktiviert und muss in den Einstellungen neu eingerichtet werden.',
				[{ text: 'OK', onPress: () => navigation.goBack() }]
			);
		} catch (e) {
			Alert.alert('Fehler', e.message || 'Passwort konnte nicht geändert werden.');
		} finally {
			setLoading(false);
		}
	};

	const handleBiometricReset = async () => {
		if (!validateNewPasswords()) return;

		setLoading(true);
		try {
			await resetPasswordViaBiometrics(newPassword);
			Alert.alert(
				'Erfolg',
				'Passwort wurde zurückgesetzt.\n\nHinweis: Der Fingerabdruck-Login wurde deaktiviert und muss in den Einstellungen neu eingerichtet werden.',
				[{ text: 'OK', onPress: () => navigation.goBack() }]
			);
		} catch (e) {
			Alert.alert('Fehler', e.message || 'Zurücksetzen fehlgeschlagen.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Passwort ändern</Text>

			{/* Mode-Switcher – nur anzeigen wenn Biometrie verfügbar */}
			{isBiometricSupported && (
				<View style={styles.modeSwitch}>
					<TouchableOpacity
						style={[styles.modeBtn, mode === 'classic' && styles.modeBtnActive]}
						onPress={() => setMode('classic')}
					>
						<Text style={[styles.modeBtnText, mode === 'classic' && styles.modeBtnTextActive]}>
							Altes Passwort
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.modeBtn, mode === 'biometric' && styles.modeBtnActive]}
						onPress={() => setMode('biometric')}
					>
						<Text style={[styles.modeBtnText, mode === 'biometric' && styles.modeBtnTextActive]}>
							🔑 Passwort vergessen?
						</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Hinweis im Biometrie-Modus */}
			{mode === 'biometric' && (
				<View style={styles.infoBox}>
					<Text style={styles.infoText}>
						Du wirst per Fingerabdruck identifiziert. Danach kannst du ein neues Passwort setzen –
						ohne das alte eingeben zu müssen. Deine Daten bleiben erhalten.
					</Text>
				</View>
			)}

			{/* Altes Passwort – nur im Classic-Modus */}
			{mode === 'classic' && (
				<>
					<Text style={styles.label}>Altes Passwort</Text>
					<TextInput
						style={styles.input}
						value={oldPassword}
						onChangeText={setOldPassword}
						secureTextEntry
						placeholder="Aktuelles Passwort eingeben"
					/>
				</>
			)}

			<Text style={styles.label}>Neues Passwort</Text>
			<TextInput
				style={styles.input}
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				placeholder="Neues Passwort eingeben"
			/>

			<Text style={styles.label}>Neues Passwort bestätigen</Text>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				placeholder="Neues Passwort wiederholen"
			/>

			{loading ? (
				<ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 16 }} />
			) : mode === 'biometric' ? (
				<TouchableOpacity style={styles.buttonBiometric} onPress={handleBiometricReset}>
					<Text style={styles.buttonText}>🔐 Per Fingerabdruck bestätigen & Reset</Text>
				</TouchableOpacity>
			) : (
				<TouchableOpacity style={styles.button} onPress={handleClassicChange}>
					<Text style={styles.buttonText}>Passwort ändern</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		backgroundColor: '#f8f9fa',
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1e1b4b',
		marginBottom: 24,
	},
	modeSwitch: {
		flexDirection: 'row',
		backgroundColor: '#e5e7eb',
		borderRadius: 10,
		padding: 4,
		marginBottom: 20,
	},
	modeBtn: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: 'center',
	},
	modeBtnActive: {
		backgroundColor: '#ffffff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	modeBtnText: {
		fontSize: 13,
		color: '#6b7280',
		fontWeight: '500',
	},
	modeBtnTextActive: {
		color: '#4f46e5',
		fontWeight: '700',
	},
	infoBox: {
		backgroundColor: '#eef2ff',
		borderLeftWidth: 4,
		borderLeftColor: '#4f46e5',
		borderRadius: 8,
		padding: 14,
		marginBottom: 20,
	},
	infoText: {
		color: '#3730a3',
		fontSize: 14,
		lineHeight: 20,
	},
	label: {
		fontSize: 14,
		marginBottom: 6,
		fontWeight: '600',
		color: '#374151',
	},
	input: {
		borderWidth: 1,
		borderColor: '#d1d5db',
		padding: 12,
		borderRadius: 8,
		marginBottom: 18,
		fontSize: 16,
		backgroundColor: '#ffffff',
	},
	button: {
		backgroundColor: '#4f46e5',
		padding: 16,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 4,
	},
	buttonBiometric: {
		backgroundColor: '#059669',
		padding: 16,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 4,
	},
	buttonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '700',
	},
});
