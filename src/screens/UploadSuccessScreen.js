import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {Colors} from '../constants';
import {getInvoiceDetails} from '../services/api';
import {useAuth} from '../context/AuthContext';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const UploadSuccessScreen = ({route, navigation}) => {
  const {invoiceNumber} = route.params ?? {};
  const {token} = useAuth();

  const handleViewInvoice = async () => {
    if (!invoiceNumber) return;
    
    const result = await getInvoiceDetails(
      {invoice_number: invoiceNumber},
      token ? {token} : {},
    );
    
    if (result.success && result.data) {
      navigation.navigate('InvoiceDetail', {invoice: result.data});
    } else {
      // Still navigate but with error handling
      navigation.navigate('InvoiceDetail', {
        invoice: {invoice_number: invoiceNumber},
      });
    }
  };

  const handleScanNew = () => {
    // Reset navigation stack and go to Scanner
    navigation.reset({
      index: 1,
      routes: [
        {name: 'Home'},
        {name: 'Scanner'},
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <Text style={styles.title}>Success!</Text>
        <Text style={styles.message}>
          Product images have been uploaded successfully.
        </Text>
        <Text style={styles.invoiceText}>
          Invoice: {invoiceNumber || '—'}
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleViewInvoice}
            activeOpacity={0.85}>
            <Text style={styles.buttonText}>View Current Invoice Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleScanNew}
            activeOpacity={0.85}>
            <Text style={styles.buttonSecondaryText}>Scan New Invoice</Text>
          </TouchableOpacity>
        </View>
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
    padding: isTablet ? 40 : 24,
  },
  content: {
    width: '100%',
    maxWidth: isTablet ? 600 : width - 48,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {elevation: 6},
    }),
  },
  successIcon: {
    fontSize: 60,
    color: Colors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: isTablet ? 18 : 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  invoiceText: {
    fontSize: isTablet ? 16 : 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {elevation: 3},
    }),
  },
  buttonText: {
    color: Colors.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonSecondaryText: {
    color: Colors.primary,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
});

export default UploadSuccessScreen;
