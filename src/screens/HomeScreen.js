import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Colors} from '../constants';
import {useAuth} from '../context/AuthContext';
import {getInvoiceDetails} from '../services/api';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const HomeScreen = ({navigation}) => {
  const {token} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleScanInvoice = async () => {
    // TEST MODE: Automatically use test invoice number
    const testInvoiceNumber = 'UXJ1SXR8';
    
    setIsLoading(true);
    try {
      const result = await getInvoiceDetails(
        {invoice_number: testInvoiceNumber},
        token ? {token} : {},
      );
      setIsLoading(false);

      if (result.success) {
        navigation.replace('InvoiceDetail', {invoice: result.data});
      } else {
        Alert.alert('Error', result.message || 'Failed to get invoice details.');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan Invoice</Text>
        <Text style={styles.subtitle}>
          Tap the button below to scan an invoice QR code.
        </Text>
        <TouchableOpacity
          style={[styles.scanButton, isLoading && styles.scanButtonDisabled]}
          onPress={handleScanInvoice}
          activeOpacity={0.8}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.scanButtonText}>Scan the invoice</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxWidth: isTablet ? 500 : '100%',
    padding: isTablet ? 40 : 24,
    alignItems: 'center',
  },
  title: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingVertical: isTablet ? 20 : 16,
    paddingHorizontal: isTablet ? 48 : 32,
    borderRadius: 12,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: Colors.white,
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
