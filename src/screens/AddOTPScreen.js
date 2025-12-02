import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { OTPContext } from '../context/OTPContext';

export default function AddOTPScreen({ navigation, route }) {
	const [issuer, setIssuer] = useState('');
	const [name, setName] = useState('');
	const [secret, setSecret] = useState('');
	const { addSecret } = useContext(OTPContext);

	React.useEffect(() => {
		console.log('AddOTP: Params received', route.params);
		if (route.params?.scannedSecret) {
			setSecret(route.params.scannedSecret);
		}
		if (route.params?.scannedName) {
			setName(route.params.scannedName);
		}
		if (route.params?.scannedIssuer) {
			setIssuer(route.params.scannedIssuer);
		}
	}, [route.params]);

	const handleAdd = async () => {
		if (!name || !secret) {
			Alert.alert('Error', 'Name and Secret are required');
			return;
		}

		try {
			// Basic validation of base32
			const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
			if (!/^[A-Z2-7]+$/.test(cleanSecret)) {
				Alert.alert('Error', 'Invalid secret format (Base32 required)');
				return;
			}

			await addSecret(name, cleanSecret, issuer);
			navigation.goBack();
		} catch (e) {
			Alert.alert('Error', 'Failed to add secret');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Issuer (Optional)</Text>
			<TextInput
				style={styles.input}
				value={issuer}
				onChangeText={setIssuer}
				placeholder="e.g. Google"
			/>

			<Text style={styles.label}>Account Name</Text>
			<TextInput
				style={styles.input}
				value={name}
				onChangeText={setName}
				placeholder="e.g. user@gmail.com"
			/>

			<Text style={styles.label}>Secret Key</Text>
			<TextInput
				style={styles.input}
				value={secret}
				onChangeText={setSecret}
				placeholder="Base32 Secret"
				autoCapitalize="characters"
			/>

			<Button title="Save" onPress={handleAdd} />

			<View style={styles.spacer} />

			<Button
				title="Scan QR Code"
				onPress={() => navigation.navigate('ScanQR')}
				color="#666"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#fff',
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
	spacer: {
		height: 20,
	},
});
