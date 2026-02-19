import React, {useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

import {AuthProvider, useAuth} from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import AgreementPreviewScreen from '../screens/AgreementPreviewScreen';
import DocumentUploadsScreen from '../screens/DocumentUploadsScreen';
import UploadProductImagesScreen from '../screens/UploadProductImagesScreen';
import PdfViewerScreen from '../screens/PdfViewerScreen';
import {Colors} from '../constants';
import {hasSeenSplashRef} from './navRefs';

const Stack = createNativeStackNavigator();

function LogoutHeaderButton() {
  const {logout} = useAuth();
  const handleLogout = () => {
    hasSeenSplashRef.current = true;
    logout();
  };
  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={styles.logoutButton}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  );
}

function AuthStack() {
  const initialRoute = hasSeenSplashRef.current ? 'Login' : 'Splash';
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        listeners={{
          focus: () => {
            hasSeenSplashRef.current = true;
          },
        }}
      />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {backgroundColor: Colors.background},
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {fontWeight: '600', fontSize: 18},
        headerRight: () => <LogoutHeaderButton />,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: ''}}
      />
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scan Invoice',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="InvoiceDetail"
        component={InvoiceDetailScreen}
        options={{title: 'Invoice details'}}
      />
      <Stack.Screen
        name="AgreementPreview"
        component={AgreementPreviewScreen}
        options={{title: 'Agreement'}}
      />
      <Stack.Screen
        name="DocumentUploads"
        component={DocumentUploadsScreen}
        options={{title: 'Step 2 – Document uploads'}}
      />
      <Stack.Screen
        name="UploadProductImages"
        component={UploadProductImagesScreen}
        options={{title: 'Step 3 – Upload product images'}}
      />
      <Stack.Screen
        name="PdfViewer"
        component={PdfViewerScreen}
        options={({route}) => ({title: route.params?.title || 'PDF'})}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const {isLoggedIn} = useAuth();
  return isLoggedIn ? <MainStack key="main" /> : <AuthStack key="auth" />;
}

const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  logoutButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppNavigator;
