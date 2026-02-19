import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {Colors} from '../constants';

const {width, height} = Dimensions.get('window');

const PdfViewerScreen = ({route, navigation}) => {
  const {url, title = 'PDF'} = route.params ?? {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!url) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No PDF URL provided.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const encodedUrl = encodeURIComponent(url);
  const viewerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; background: #525659; }
        iframe { position: absolute; left: 0; top: 0; width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <iframe src="https://docs.google.com/viewer?url=${encodedUrl}&embedded=true" />
    </body>
    </html>
  `;

  const webViewSource =
    Platform.OS === 'ios'
      ? {uri: url}
      : {html: viewerHtml};

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading PDF…</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Could not load PDF.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
      <WebView
        source={webViewSource}
        style={[styles.webview, (loading || error) && styles.webviewHidden]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setError(true)}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit
        startInLoadingState={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#525659',
  },
  webview: {
    flex: 1,
    width,
    height,
    backgroundColor: 'transparent',
  },
  webviewHidden: {
    opacity: 0,
    position: 'absolute',
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#525659',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.white,
  },
  errorWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#525659',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#525659',
    padding: 24,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  backBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PdfViewerScreen;
