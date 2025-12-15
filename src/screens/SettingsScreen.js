import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Button, Alert, TouchableOpacity, ActivityIndicator, Modal, TextInput, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import { OTPContext } from '../context/OTPContext';
import { encryptData, decryptData } from '../utils/crypto';

export default function SettingsScreen({ navigation }) {
	const {
		isBiometricSupported,
		enableBiometrics,
		disableBiometrics,
		logout,
		masterKey
	} = useContext(AuthContext);
	const { secrets, addSecret, saveSecrets } = useContext(OTPContext);

	const [biometricsEnabled, setBiometricsEnabled] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [passwordInput, setPasswordInput] = useState('');
	const [modalAction, setModalAction] = useState(null); // 'enableBio' or 'import'
	const [importedData, setImportedData] = useState(null);

	useEffect(() => {
		checkBiometricStatus();
	}, []);

	const checkBiometricStatus = async () => {
		const enabled = await SecureStore.getItemAsync('biometric_auth_enabled');
		setBiometricsEnabled(enabled === 'true');
	};

	const handleBiometricToggle = async (value) => {
		if (value) {
			setModalAction('enableBio');
			setShowPasswordModal(true);
		} else {
			try {
				await disableBiometrics();
				setBiometricsEnabled(false);
			} catch (e) {
				Alert.alert('Error', 'Failed to disable biometrics');
			}
		}
	};

	const handleExport = async () => {
		try {
			if (!secrets || secrets.length === 0) {
				Alert.alert('No Data', 'There are no OTPs to export.');
				return;
			}

			const dataToExport = JSON.stringify(secrets);
			const encryptedExport = encryptData(dataToExport, masterKey);
			const filename = 'otp_backup.json';

			// Android Special Handling: Use Storage Access Framework
			if (Platform.OS === 'android') {
				try {
					const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
					if (permissions.granted) {
						const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, 'otp_backup', 'application/json');
						await FileSystem.writeAsStringAsync(uri, encryptedExport, { encoding: FileSystem.EncodingType.UTF8 });
						Alert.alert('Success', 'Backup saved successfully!');
					} else {
						// User cancelled selection
						return;
					}
				} catch (e) {
					console.error('SAF Error', e);
					// Fallback to old method if SAF fails for some reason
					await shareFile(encryptedExport, filename);
				}
			} else {
				// iOS / Others: Use standard share
				await shareFile(encryptedExport, filename);
			}

		} catch (e) {
			console.error(e);
			Alert.alert('Error', 'Export failed: ' + e.message);
		}
	};

	const shareFile = async (content, filename) => {
		const fileUri = FileSystem.cacheDirectory + filename;
		await FileSystem.writeAsStringAsync(fileUri, content);

		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(fileUri, {
				mimeType: 'application/json',
				dialogTitle: 'Export OTP Backup',
				UTI: 'public.json'
			});
		} else {
			Alert.alert('Error', 'Sharing is not available on this device');
		}
	};

	const handleImport = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: '*/*',
				copyToCacheDirectory: true,
			});

			if (result.canceled) return;

			const fileUri = result.assets[0].uri;
			let fileContent;

			if (Platform.OS === 'web') {
				// On web, uri is a blob url, so we can fetch it
				const response = await fetch(fileUri);
				fileContent = await response.text();
			} else {
				fileContent = await FileSystem.readAsStringAsync(fileUri);
			}

			// Try to decrypt with current master key first
			try {
				const decrypted = decryptData(fileContent, masterKey);
				const parsed = JSON.parse(decrypted);
				confirmImport(parsed);
			} catch (e) {
				// Failed with current key, ask for key
				setImportedData(fileContent);
				setModalAction('import');
				setShowPasswordModal(true);
			}

		} catch (e) {
			console.error(e);
			Alert.alert('Error', 'Import failed reading file');
		}
	};

	const confirmImport = async (data) => {
		if (Platform.OS === 'web') {
			if (window.confirm(`Found ${data.length} accounts. This will REPLACE your current list. Are you sure?`)) {
				try {
					await saveSecrets(data);
					window.alert('Success: Data imported successfully');
				} catch (e) {
					console.error('Import error:', e);
					window.alert('Error: Failed to save imported data (' + e.message + ')');
				}
			}
		} else {
			Alert.alert(
				'Confirm Import',
				`Found ${data.length} accounts. This will REPLACE your current list. Are you sure?`,
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Import',
						onPress: async () => {
							try {
								await saveSecrets(data);
								Alert.alert('Success', 'Data imported successfully');
							} catch (e) {
								console.error('Import error:', e);
								Alert.alert('Error', 'Failed to save imported data');
							}
						},
						style: 'destructive'
					}
				]
			);
		}
	};

	const handleModalSubmit = async () => {
		if (!passwordInput) return;

		try {
			if (modalAction === 'enableBio') {
				await enableBiometrics(passwordInput);
				setBiometricsEnabled(true);
				Alert.alert('Success', 'Biometrics enabled');
			} else if (modalAction === 'import') {
				const decrypted = decryptData(importedData, passwordInput);
				const parsed = JSON.parse(decrypted);
				confirmImport(parsed);
			}
			closeModal();
		} catch (e) {
			Alert.alert('Error', e.message || 'Operation failed');
		}
	};

	const closeModal = () => {
		setShowPasswordModal(false);
		setPasswordInput('');
		setImportedData(null);
		setModalAction(null);
	};

	return (
		<View style={styles.container}>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Security</Text>
				{isBiometricSupported && (
					<View style={styles.row}>
						<Text style={styles.label}>Biometric Authentication</Text>
						<Switch
							value={biometricsEnabled}
							onValueChange={handleBiometricToggle}
						/>
					</View>
				)}
				<Button
					title="Change Access Password"
					onPress={() => navigation.navigate('ChangePassword')}
				/>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Data Management</Text>
				<View style={styles.buttonGap}>
					<Button title="Export Data" onPress={handleExport} />
				</View>
				<View style={styles.buttonGap}>
					<Button title="Import Data" onPress={handleImport} />
				</View>
			</View>

			<View style={styles.section}>
				<Button title="Logout" color="red" onPress={logout} />
			</View>

			<Modal
				visible={showPasswordModal}
				transparent
				animationType="slide"
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							{modalAction === 'enableBio' ? 'Enter Access Password' : 'Enter Backup Password'}
						</Text>
						<TextInput
							style={styles.input}
							secureTextEntry
							placeholder="Password"
							value={passwordInput}
							onChangeText={setPasswordInput}
						/>
						<View style={styles.modalButtons}>
							<Button title="Cancel" onPress={closeModal} color="red" />
							<Button title="Submit" onPress={handleModalSubmit} />
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#f5f5f5',
	},
	section: {
		marginBottom: 30,
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 10,
		gap: 10,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#666',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	label: {
		fontSize: 16,
	},
	buttonGap: {
		marginBottom: 10,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		padding: 20,
	},
	modalContent: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		padding: 10,
		borderRadius: 5,
		marginBottom: 20,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
});
