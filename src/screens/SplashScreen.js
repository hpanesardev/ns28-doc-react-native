import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import {Colors} from '../constants';

const {width, height} = Dimensions.get('window');
const isTablet = width >= 768;

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    // Navigate to Login screen after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.content}>
        <Text style={styles.logo}>NM. Jewellery</Text>
        <Text style={styles.subtitle}>Doc Manager</Text>
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={styles.loader}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.poweredBy}>Powered by PVC</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: isTablet ? 600 : '100%',
    paddingHorizontal: isTablet ? 40 : 20,
  },
  logo: {
    fontSize: isTablet ? 72 : 48,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: isTablet ? 24 : 18,
    color: Colors.lightGray,
    marginBottom: 40,
    fontWeight: '300',
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: isTablet ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: isTablet ? 16 : 14,
    color: Colors.textLight,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
