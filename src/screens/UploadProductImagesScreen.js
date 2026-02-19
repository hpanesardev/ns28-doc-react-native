import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../constants';

/**
 * Step 3 – Upload product images.
 * Placeholder until product images flow is defined.
 */
const UploadProductImagesScreen = ({route}) => {
  const {invoiceNumber} = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 3 – Upload product images</Text>
      <Text style={styles.subtitle}>
        Invoice: {invoiceNumber || '—'}
      </Text>
      <Text style={styles.placeholder}>
        Product image upload options will be added here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  placeholder: {
    fontSize: 15,
    color: Colors.textLight,
  },
});

export default UploadProductImagesScreen;
