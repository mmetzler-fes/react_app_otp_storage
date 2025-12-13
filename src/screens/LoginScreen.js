import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
	const [accessPassword, setAccessPassword] = useState('');
	const { login, loginWithBiometrics, isBiometricSupported } = useContext(AuthContext);

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
