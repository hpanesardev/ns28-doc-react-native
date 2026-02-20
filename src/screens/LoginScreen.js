import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import {Colors} from '../constants';
import {useAuth} from '../context/AuthContext';
import {login as loginApi} from '../services/api';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const LoginScreen = ({navigation}) => {
  const {login: setAuth} = useAuth();
  // const [username, setUsername] = useState('info@prinzvirtualcoders.ch');
  // const [password, setPassword] = useState('12345678');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await loginApi({username: username.trim(), password});
    setIsLoading(false);

    if (result.success) {
      setAuth(result.data?.user ?? result.data, result.data?.token ?? null);
      navigation.replace('Home');
    } else {
      Alert.alert('Login Failed', result.message || 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/logo.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}>
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: isTablet ? 40 : 24,
    justifyContent: 'center',
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: isTablet ? 50 : 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: isTablet ? 30 : 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: isTablet ? 500 : 200,
    height: isTablet ? 180 : 60,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    height: isTablet ? 60 : 50,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: isTablet ? 18 : 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  loginButton: {
    height: isTablet ? 60 : 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
