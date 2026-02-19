import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ScrollView,
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
        <Text style={styles.errorText}>No URL provided.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if URL is an image
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url) || url.includes('image');

  // If it's an image, display it directly
  if (isImage) {
    return (
      <View style={styles.imageViewContainer}>
        <ScrollView
          style={styles.imageContainer}
          contentContainerStyle={styles.imageContent}
          maximumZoomScale={5}
          minimumZoomScale={1}>
          <Image
            source={{uri: url}}
            style={styles.image}
            resizeMode="contain"
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => setError(true)}
          />
        </ScrollView>
        {loading && (
          <View style={styles.imageLoadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.imageLoadingText}>Loading image…</Text>
          </View>
        )}
        {error && (
          <View style={styles.imageErrorWrap}>
            <Text style={styles.imageErrorText}>Could not load image.</Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // For PDFs, use WebView
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
  imageViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  imageContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
  },
  imageLoadingWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  imageErrorWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imageErrorText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default PdfViewerScreen;
