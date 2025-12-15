import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
	const [accessPassword, setAccessPassword] = useState('');
	const { login, loginWithBiometrics, isBiometricSupported, resetApp } = useContext(AuthContext);

	useEffect(() => {
		if (isBiometricSupported) {
			loginWithBiometrics();
		}
	}, [isBiometricSupported]);

	const handleLogin = async () => {
		try {
			await login(accessPassword);
		} catch (e) {
			Alert.alert('Error', 'Invalid Access Password');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Unlock OTP Secure</Text>

			<Text style={styles.label}>Access Password</Text>
			<TextInput
				style={styles.input}
				secureTextEntry
				value={accessPassword}
				onChangeText={setAccessPassword}
				placeholder="Enter Access Password"
			/>

			<Button title="Unlock" onPress={handleLogin} />

			{isBiometricSupported && (
				<View style={{ marginTop: 20 }}>
					<Button title="Login with Biometrics" onPress={loginWithBiometrics} color="#4CAF50" />
				</View>
			)}

			<View style={{ marginTop: 40 }}>
				<Button
					title="Reset App (Clear All Data)"
					onPress={() => {
						if (Platform.OS === 'web') {
							// Web/Tauri specific confirmation
							if (window.confirm('Reset Application\n\nAre you sure you want to reset the application? This will delete all your stored passwords and OTPs.')) {
								resetApp().then(() => {
									window.alert('Success: Application reset successfully.');
								}).catch(() => {
									window.alert('Error: Failed to reset application');
								});
							}
						} else {
							// Mobile confirmation
							Alert.alert(
								'Reset Application',
								'Are you sure you want to reset the application? This will delete all your stored passwords and OTPs.',
								[
									{ text: 'Cancel', style: 'cancel' },
									{
										text: 'Reset',
										style: 'destructive',
										onPress: async () => {
											try {
												await resetApp();
												Alert.alert('Success', 'Application reset successfully. You can now set it up again.');
											} catch (e) {
												Alert.alert('Error', 'Failed to reset application');
											}
										}
									}
								]
							);
						}
					}}
					color="#FF3B30"
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 30,
		textAlign: 'center',
	},
	label: {
		fontSize: 14,
		marginBottom: 5,
		fontWeight: '600',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		padding: 10,
		borderRadius: 5,
		marginBottom: 20,
		fontSize: 16,
	},
});
