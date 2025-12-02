import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function SetupScreen() {
	const [masterPassword, setMasterPassword] = useState('');
	const [accessPassword, setAccessPassword] = useState('');
	const [confirmAccessPassword, setConfirmAccessPassword] = useState('');
	const { setup } = useContext(AuthContext);

	const handleSetup = async () => {
		console.log('Setup button pressed');
		if (!masterPassword || !accessPassword) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}
		if (accessPassword !== confirmAccessPassword) {
			Alert.alert('Error', 'Access passwords do not match');
			return;
		}

		try {
			await setup(masterPassword, accessPassword);
		} catch (e) {
			Alert.alert('Error', 'Setup failed: ' + e.message);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to OTP Secure</Text>
			<Text style={styles.subtitle}>Setup your security credentials</Text>

			<Text style={styles.label}>Master Password (encrypts your data)</Text>
			<TextInput
				style={styles.input}
				secureTextEntry
				value={masterPassword}
				onChangeText={setMasterPassword}
				placeholder="Enter Master Password"
			/>

			<Text style={styles.label}>Access Password (unlocks the app)</Text>
			<TextInput
				style={styles.input}
				secureTextEntry
				value={accessPassword}
				onChangeText={setAccessPassword}
				placeholder="Enter Access Password"
			/>

			<Text style={styles.label}>Confirm Access Password</Text>
			<TextInput
				style={styles.input}
				secureTextEntry
				value={confirmAccessPassword}
				onChangeText={setConfirmAccessPassword}
				placeholder="Confirm Access Password"
			/>

			<Button title="Complete Setup" onPress={handleSetup} />
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
		marginBottom: 10,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
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
