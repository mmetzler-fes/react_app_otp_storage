import React, { useState, useEffect, useContext } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { OTPContext } from '../context/OTPContext';
import * as OTPAuth from 'otpauth';

export default function ScanQRScreen({ navigation }) {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(false);
	const { addSecret } = useContext(OTPContext);

	useEffect(() => {
		const getPermissions = async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === 'granted');
		};
		getPermissions();
	}, []);

	const handleBarCodeScanned = async ({ type, data }) => {
		setScanned(true);
		try {
			if (!data.startsWith('otpauth://')) {
				throw new Error('Invalid QR Code');
			}

			const uri = OTPAuth.URI.parse(data);
			const secret = uri.secret.base32;
			const name = uri.account;
			const issuer = uri.issuer || '';

			console.log('ScanQR: Parsed data', { name, secret, issuer });

			// await addSecret(name, secret, issuer);
			navigation.navigate('AddOTP', {
				scannedName: name,
				scannedSecret: secret,
				scannedIssuer: issuer
			});
		} catch (e) {
			Alert.alert('Error', 'Failed to parse QR code: ' + e.message, [
				{ text: 'Try Again', onPress: () => setScanned(false) },
			]);
		}
	};

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={styles.container}>
			<CameraView
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ["qr"],
				}}
				style={StyleSheet.absoluteFillObject}
			/>
			{scanned && (
				<Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
	},
});
