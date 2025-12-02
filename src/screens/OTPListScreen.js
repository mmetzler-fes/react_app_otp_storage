import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as OTPAuth from 'otpauth';
import { OTPContext } from '../context/OTPContext';
import { AuthContext } from '../context/AuthContext';

const OTPItem = ({ item, onRemove, navigation }) => {
	const [code, setCode] = useState('');
	const [timeLeft, setTimeLeft] = useState(0);

	useEffect(() => {
		const totp = new OTPAuth.TOTP({
			secret: OTPAuth.Secret.fromBase32(item.secret),
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
		});

		const update = () => {
			setCode(totp.generate());
			setTimeLeft(30 - (Math.floor(Date.now() / 1000) % 30));
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [item.secret]);

	const copyToClipboard = async () => {
		await Clipboard.setStringAsync(code);
		Alert.alert('Copied', 'Code copied to clipboard');
	};

	const handleLongPress = () => {
		navigation.navigate('EditOTP', { secretId: item.id });
	};

	return (
		<TouchableOpacity
			style={styles.item}
			onPress={copyToClipboard}
			onLongPress={handleLongPress}
		>
			<View style={styles.info}>
				<Text style={styles.issuer}>{item.issuer || 'Unknown Issuer'}</Text>
				<Text style={styles.name}>{item.name}</Text>
			</View>
			<View style={styles.codeContainer}>
				<Text style={styles.code}>{code}</Text>
				<Text style={styles.timer}>{timeLeft}s</Text>
			</View>
		</TouchableOpacity>
	);
};

export default function OTPListScreen({ navigation }) {
	const { secrets, removeSecret } = useContext(OTPContext);
	const { logout } = useContext(AuthContext);

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity onPress={() => navigation.navigate('AddOTP')} style={styles.headerButton}>
					<Text style={styles.headerButtonText}>+</Text>
				</TouchableOpacity>
			),
			headerLeft: () => (
				<TouchableOpacity onPress={logout} style={styles.headerButton}>
					<Text style={styles.headerButtonText}>Logout</Text>
				</TouchableOpacity>
			),
		});
	}, [navigation, logout]);

	return (
		<View style={styles.container}>
			<FlatList
				data={secrets}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <OTPItem item={item} onRemove={removeSecret} navigation={navigation} />}
				ListEmptyComponent={
					<Text style={styles.emptyText}>No OTPs yet. Tap + to add one.</Text>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	item: {
		backgroundColor: '#fff',
		padding: 20,
		marginVertical: 8,
		marginHorizontal: 16,
		borderRadius: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		elevation: 2,
	},
	info: {
		flex: 1,
	},
	issuer: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#000',
		marginBottom: 4,
	},
	name: {
		fontSize: 16,
		color: '#666',
	},
	codeContainer: {
		alignItems: 'flex-end',
	},
	code: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#007AFF',
	},
	timer: {
		fontSize: 12,
		color: '#999',
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 50,
		fontSize: 16,
		color: '#666',
	},
	headerButton: {
		marginHorizontal: 15,
	},
	headerButtonText: {
		fontSize: 18,
		color: '#007AFF',
	},
});
