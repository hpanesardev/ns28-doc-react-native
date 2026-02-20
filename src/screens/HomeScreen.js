import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Colors} from '../constants';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan Invoice</Text>
        <Text style={styles.subtitle}>
          Tap the button below to scan an invoice QR code.
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
          activeOpacity={0.8}>
          <Text style={styles.scanButtonText}>Scan the invoice</Text>
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
  scanButtonText: {
    color: Colors.white,
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
