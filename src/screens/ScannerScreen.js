import React, {useRef, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Linking,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  Camera,
  useCodeScanner,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {Colors} from '../constants';
import {useAuth} from '../context/AuthContext';
import {getInvoiceDetails} from '../services/api';

const ScannerScreen = ({navigation}) => {
  const {token} = useAuth();
  const hasScanned = useRef(false);
  const {hasPermission, requestPermission} = useCameraPermission();
  const [isLoading, setIsLoading] = useState(false);
  const device = useCameraDevice('back');

  useFocusEffect(
    useCallback(() => {
      hasScanned.current = false;
    }, []),
  );

  const onCodeScanned = useCallback(
    async (codes) => {
      if (hasScanned.current || isLoading || !codes.length) return;
      const code = codes[0];
      const invoiceNumber = code?.value?.trim?.();
      if (!invoiceNumber) return;

      hasScanned.current = true;
      setIsLoading(true);

      const result = await getInvoiceDetails(
        {invoice_number: invoiceNumber},
        token ? {token} : {},
      );
      setIsLoading(false);

      if (result.success) {
        navigation.replace('InvoiceDetail', {invoice: result.data});
      } else {
        hasScanned.current = false;
        Alert.alert('Error', result.message || 'Failed to get invoice details.');
      }
    },
    [isLoading, navigation, token],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'],
    onCodeScanned,
    scanInterval: 2000,
  });

  const handleCancel = () => {
    if (!isLoading) navigation.goBack();
  };

  const handleGrantOrOpenSettings = async () => {
    const status = Camera.getCameraPermissionStatus();
    if (status === 'denied' || status === 'restricted') {
      await Linking.openSettings();
    } else {
      const result = await requestPermission();
      if (result === 'denied') {
        Alert.alert(
          'Camera access',
          'To scan QR codes, enable Camera in Settings for this app.',
          [{text: 'Open Settings', onPress: () => Linking.openSettings()}, {text: 'Cancel'}],
        );
      }
    }
  };

  if (!hasPermission) {
    const permissionStatus = Camera.getCameraPermissionStatus();
    const isDeniedOrRestricted = permissionStatus === 'denied' || permissionStatus === 'restricted';

    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Camera access is needed to scan QR codes.
        </Text>
        {isDeniedOrRestricted && (
          <Text style={styles.settingsHint}>
            Camera was turned off. Open Settings and enable Camera for this app.
          </Text>
        )}
        <View style={styles.permissionButtons}>
          <TouchableOpacity
            style={styles.grantButton}
            onPress={handleGrantOrOpenSettings}>
            <Text style={styles.grantButtonText}>
              {isDeniedOrRestricted ? 'Open Settings' : 'Grant camera access'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButtonSecondary} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No camera device found.</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!isLoading}
        codeScanner={codeScanner}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.loadingText}>Fetching invoice details...</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancel}
        disabled={isLoading}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    padding: 24,
  },
  errorText: {
    color: Colors.white,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  settingsHint: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    marginTop: 12,
    fontSize: 16,
  },
  permissionButtons: {
    width: '100%',
    maxWidth: 320,
    marginTop: 8,
  },
  grantButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  grantButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  backButtonSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ScannerScreen;
