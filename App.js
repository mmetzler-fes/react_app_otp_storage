import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens(false);
import React, { useContext } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';
console.log('App.js: Bundle loaded');
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { OTPProvider } from './src/context/OTPContext';

import SetupScreen from './src/screens/SetupScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPListScreen from './src/screens/OTPListScreen';
import AddOTPScreen from './src/screens/AddOTPScreen';
import EditOTPScreen from './src/screens/EditOTPScreen';
import ScanQRScreen from './src/screens/ScanQRScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isSetup, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!isSetup ? (
        <Stack.Screen name="Setup" component={SetupScreen} options={{ title: 'Setup OTP Secure' }} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      ) : (
        <>
          <Stack.Screen
            name="OTPList"
            component={OTPListScreen}
            options={{ title: 'My Codes' }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="AddOTP" component={AddOTPScreen} options={{ title: 'Add Account' }} />
          <Stack.Screen name="EditOTP" component={EditOTPScreen} options={{ title: 'Edit Account' }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
          <Stack.Screen name="ScanQR" component={ScanQRScreen} options={{ title: 'Scan QR Code' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OTPProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </OTPProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
