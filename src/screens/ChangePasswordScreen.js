import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ChangePasswordScreen({ navigation }) {
	const { changeAccessPassword } = useContext(AuthContext);
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const handleChange = async () => {
		if (!oldPassword || !newPassword || !confirmPassword) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert('Error', 'New passwords do not match');
			return;
		}

		if (newPassword.length < 4) {
			Alert.alert('Error', 'New password must be at least 4 characters');
			return;
		}

		try {
			await changeAccessPassword(oldPassword, newPassword);
			Alert.alert('Success', 'Password changed successfully', [
				{ text: 'OK', onPress: () => navigation.goBack() }
			]);
		} catch (e) {
			Alert.alert('Error', e.message || 'Failed to change password');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>Old Password</Text>
			<TextInput
				style={styles.input}
				value={oldPassword}
				onChangeText={setOldPassword}
				secureTextEntry
				placeholder="Enter current password"
			/>

			<Text style={styles.label}>New Password</Text>
			<TextInput
				style={styles.input}
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				placeholder="Enter new password"
			/>

			<Text style={styles.label}>Confirm New Password</Text>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				placeholder="Confirm new password"
			/>

			<Button title="Change Password" onPress={handleChange} />
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
});
