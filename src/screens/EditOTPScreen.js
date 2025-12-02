import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as OTPAuth from 'otpauth';
import { OTPContext } from '../context/OTPContext';

export default function EditOTPScreen({ navigation, route }) {
	const { secretId } = route.params;
	const { secrets, updateSecret, removeSecret } = useContext(OTPContext);

	const [issuer, setIssuer] = useState('');
	const [name, setName] = useState('');
	const [secret, setSecret] = useState('');
	const [showQR, setShowQR] = useState(false);

	useEffect(() => {
		const item = secrets.find(s => s.id === secretId);
		if (item) {
			setIssuer(item.issuer || '');
			setName(item.name || '');
			setSecret(item.secret || '');
		}
	}, [secretId, secrets]);

	const handleSave = async () => {
		if (!name || !secret) {
			Alert.alert('Error', 'Name and Secret are required');
			return;
		}

		try {
			const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
			if (!/^[A-Z2-7]+$/.test(cleanSecret)) {
				Alert.alert('Error', 'Invalid secret format (Base32 required)');
				return;
			}

			await updateSecret(secretId, {
				name,
				secret: cleanSecret,
				issuer
			});
			navigation.goBack();
		} catch (e) {
			Alert.alert('Error', 'Failed to update secret');
		}
	};

	const handleDelete = () => {
		Alert.alert(
			'Delete OTP',
			'Are you sure you want to delete this account?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						await removeSecret(secretId);
						navigation.goBack();
					}
				},
			]
		);
	};

	const getOTPAuthURL = () => {
		const totp = new OTPAuth.TOTP({
			issuer: issuer || 'OTP Secure',
			label: name,
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
			secret: OTPAuth.Secret.fromBase32(secret)
		});
		return totp.toString();
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.label}>Issuer</Text>
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

			<View style={styles.buttonContainer}>
				<Button title="Save Changes" onPress={handleSave} />
			</View>

			<View style={styles.buttonContainer}>
				<Button
					title={showQR ? "Hide QR Code" : "Show QR Code"}
					onPress={() => setShowQR(!showQR)}
					color="#666"
				/>
			</View>

			{showQR && (
				<View style={styles.qrContainer}>
					<QRCode
						value={getOTPAuthURL()}
						size={200}
					/>
					<Text style={styles.qrText}>Scan to transfer to another device</Text>
				</View>
			)}

			<View style={[styles.buttonContainer, styles.deleteButton]}>
				<Button title="Delete Account" onPress={handleDelete} color="#ff3b30" />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: '#fff',
		flexGrow: 1,
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
	buttonContainer: {
		marginBottom: 15,
	},
	deleteButton: {
		marginTop: 30,
	},
	qrContainer: {
		alignItems: 'center',
		marginVertical: 20,
		padding: 20,
		backgroundColor: '#f9f9f9',
		borderRadius: 10,
	},
	qrText: {
		marginTop: 10,
		color: '#666',
		textAlign: 'center',
	},
});
