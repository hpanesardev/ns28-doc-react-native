import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {WebView} from 'react-native-webview';
import SignatureCanvas from 'react-native-signature-canvas';
import {Colors} from '../constants';
import {useAuth} from '../context/AuthContext';
import {agreementSign} from '../services/api';

const {width, height} = Dimensions.get('window');
const isTablet = width >= 768;
const SIGNATURE_PAD_HEIGHT = 120;
const AGREEMENT_VIEW_HEIGHT = Math.min(height * 0.65, 700);

const AgreementPreviewScreen = ({route, navigation}) => {
  const {agreementData, invoiceNumber, customerId} = route.params ?? {};
  const {token} = useAuth();
  const agreementHtml = agreementData?.agreement_html ?? '';
  const signatureRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const htmlSource = agreementHtml
    ? {html: `<iframe src="data:text/html;base64,${agreementHtml}" style="width:100%;height:100%;border:0;" />`}
    : null;

  const handleSignature = (sig) => {
    setHasSignature(!!sig);
  };

  const handleEmpty = () => {
    setHasSignature(false);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  };

  const handleSignatureData = async (signatureDataUrl) => {
    if (!invoiceNumber) {
      Alert.alert('Error', 'Invoice number is missing.');
      return;
    }
    setIsSubmitting(true);
    const result = await agreementSign(
      {
        invoice_number: invoiceNumber,
        signature_image: signatureDataUrl,
      },
      token ? {token} : {},
    );
    setIsSubmitting(false);
    if (result.success) {
      navigation.navigate('DocumentUploads', {invoiceNumber, customerId});
    } else {
      Alert.alert('Error', result.message || 'Could not submit agreement.');
    }
  };

  if (!agreementHtml) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No agreement content to display.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      persistentScrollbar={true}
      scrollEnabled={!isDrawing}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.scrollHint}>Scroll down to read the full agreement, then sign below.</Text>
      <View style={styles.webViewWrap}>
        <Text style={styles.sectionTitle}>Agreement</Text>
        <WebView
          source={htmlSource}
          style={[styles.webView, {height: AGREEMENT_VIEW_HEIGHT}]}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          originWhitelist={['*']}
          scalesPageToFit={true}
        />
      </View>

      <View style={styles.signatureSection}>
        <Text style={styles.sectionTitle}>Signature</Text>
        <Text style={styles.signatureHint}>Please sign below to accept the agreement.</Text>
        <View
          style={styles.signaturePadWrap}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}>
          <View style={styles.signaturePadInner}>
            {!hasSignature && (
              <View style={styles.signHerePlaceholderWrap} pointerEvents="none">
                <Text style={styles.signHerePlaceholder}>Sign Here</Text>
              </View>
            )}
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSignatureData}
              onEmpty={handleEmpty}
              onBegin={() => {
                setIsDrawing(true);
                setHasSignature(true);
              }}
              onEnd={() => setIsDrawing(false)}
              descriptionText=""
              clearText=""
              confirmText={isSubmitting ? 'Please wait...' : 'Sign & Continue'}
              webviewStyle={styles.signatureWebView}
              style={styles.signatureCanvas}
              backgroundColor="#FFFFFF"
              penColor="#1A1A1A"
              trimWhitespace={true}
              imageType="image/jpeg"
              webStyle="body,html{background:#FFFFFF !important; margin:0; padding:0;} canvas{background:#FFFFFF !important; border:none !important; display:block;}"
            />
          </View>
          <View style={styles.signatureActionsRow}>
            <TouchableOpacity style={styles.clearSignButton} onPress={handleClear}>
              <Text style={styles.clearSignButtonText}>Clear sign</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={() => {
                if (isSubmitting) return;
                if (!hasSignature) {
                  Alert.alert('Signature required', 'Please draw your signature first.');
                  return;
                }
                signatureRef.current?.readSignature();
              }}
              disabled={isSubmitting}>
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Please wait...' : 'Sign & Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollHint: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  webViewWrap: {
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    width: width - (isTablet ? 48 : 32),
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  signatureSection: {
    marginTop: 16,
  },
  signatureHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  signaturePadWrap: {
    width: '60%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: 'hidden',
  },
  signaturePadInner: {
    height: SIGNATURE_PAD_HEIGHT,
    width: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  signHerePlaceholderWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 120,
    justifyContent: 'center',
    paddingLeft: 16,
    zIndex: 1,
  },
  signHerePlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  signatureCanvas: {
    height: SIGNATURE_PAD_HEIGHT,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  signatureWebView: {
    backgroundColor: '#FFFFFF',
  },
  signatureActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  clearSignButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  clearSignButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default AgreementPreviewScreen;
