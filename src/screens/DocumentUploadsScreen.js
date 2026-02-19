import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Colors} from '../constants';
import {useAuth} from '../context/AuthContext';
import {
  getInvoiceDetails,
  getCustomerDocuments,
  customerDocumentsUpload,
} from '../services/api';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;
const CARD_WIDTH = isTablet ? (width - 72) / 2 : width - 48;
const THUMB_SIZE = 140;

const DocumentUploadsScreen = ({route, navigation}) => {
  const {invoiceNumber, customerId: paramCustomerId} = route.params ?? {};
  const {token} = useAuth();

  const [customerId, setCustomerId] = useState(paramCustomerId || null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [hasExistingDocs, setHasExistingDocs] = useState(false);
  const [existingFront, setExistingFront] = useState(null);
  const [existingBack, setExistingBack] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState(null);

  const ensureCustomerId = useCallback(async () => {
    if (paramCustomerId) {
      setCustomerId(paramCustomerId);
      return paramCustomerId;
    }
    if (!invoiceNumber || !token) return null;
    const result = await getInvoiceDetails(
      {invoice_number: invoiceNumber},
      {token},
    );
    if (result.success && result.data) {
      const inv = result.data;
      const cid = inv.customer_id ?? inv.customer?.id ?? null;
      setCustomerId(cid);
      return cid;
    }
    return null;
  }, [paramCustomerId, invoiceNumber, token]);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setLoadingError(null);
    const cid = await ensureCustomerId();
    if (!cid) {
      setLoading(false);
      setLoadingError('Could not determine customer. Please go back and try again.');
      return;
    }
    const result = await getCustomerDocuments({customer_id: cid}, token ? {token} : {});
    setLoading(false);
    if (!result.success) {
      setLoadingError(result.message || 'Failed to load documents.');
      return;
    }
    if (result.status && result.data) {
      setHasExistingDocs(true);
      setExistingFront(result.data.front ?? null);
      setExistingBack(result.data.back ?? null);
    } else {
      setHasExistingDocs(false);
      setExistingFront(null);
      setExistingBack(null);
    }
  }, [ensureCustomerId, token]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const pickImage = useCallback((side) => {
    const options = ['Camera', 'Photo library', 'Cancel'];
    const handler = (index) => {
      if (index === 2) return;
      const isCamera = index === 0;
      const opts = {
        cropping: true,
        freeStyleCropEnabled: true,
        cropperChooseText: 'Use',
        cropperCancelText: 'Cancel',
        includeBase64: false,
        mediaType: 'photo',
      };
      const setFile = side === 'front' ? setFrontFile : setBackFile;
      const toFile = (img) => {
        const uri = img.path && !String(img.path).startsWith('file://')
          ? `file://${img.path}`
          : (img.path || '');
        return {
          uri,
          type: img.mime || 'image/jpeg',
          name: img.filename || (side === 'front' ? 'doc_front.jpg' : 'doc_back.jpg'),
        };
      };
      if (isCamera) {
        ImageCropPicker.openCamera(opts)
          .then((img) => setFile(toFile(img)))
          .catch((e) => {
            if (e?.code !== 'E_PICKER_CANCELLED') {
              Alert.alert('Error', e?.message || 'Failed to capture image.');
            }
          });
      } else {
        ImageCropPicker.openPicker(opts)
          .then((img) => setFile(toFile(img)))
          .catch((e) => {
            if (e?.code !== 'E_PICKER_CANCELLED') {
              Alert.alert('Error', e?.message || 'Failed to pick image.');
            }
          });
      }
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {options, cancelButtonIndex: 2},
        handler,
      );
    } else {
      Alert.alert('Select source', undefined, [
        {text: 'Camera', onPress: () => handler(0)},
        {text: 'Photo library', onPress: () => handler(1)},
        {text: 'Cancel', style: 'cancel'},
      ]);
    }
  }, []);

  const uploadAndProceed = useCallback(async () => {
    const mustUpload = !hasExistingDocs;
    const hasNewFront = frontFile?.uri;
    const hasNewBack = backFile?.uri;
    const canProceedWithoutUpload = hasExistingDocs;
    const wantsToUpload = hasNewFront && hasNewBack;

    if (mustUpload && (!hasNewFront || !hasNewBack)) {
      Alert.alert(
        'Documents required',
        'Please upload both front and back of the document to continue.',
      );
      return;
    }

    if (wantsToUpload && customerId && invoiceNumber) {
      setUploading(true);
      const result = await customerDocumentsUpload(
        {
          customer_id: customerId,
          invoice_number: invoiceNumber,
          doc_front: frontFile,
          doc_back: backFile,
        },
        token ? {token} : {},
      );
      setUploading(false);
      if (!result.success) {
        Alert.alert('Upload failed', result.message || 'Could not upload documents.');
        return;
      }
    }

    if (!canProceedWithoutUpload && !wantsToUpload) return;
    navigation.replace('UploadProductImages', {invoiceNumber});
  }, [
    hasExistingDocs,
    frontFile,
    backFile,
    customerId,
    invoiceNumber,
    token,
    navigation,
  ]);

  const canProceed = () => {
    if (hasExistingDocs) return true;
    return !!(frontFile?.uri && backFile?.uri);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading documents…</Text>
      </View>
    );
  }

  if (loadingError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{loadingError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDocs}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}>
      <Text style={styles.subtitle}>
        Invoice: {invoiceNumber || '—'}
      </Text>
      {hasExistingDocs ? (
        <Text style={styles.hint}>
          Documents are already uploaded. You can view them or upload new ones (optional).
        </Text>
      ) : (
        <Text style={styles.hintMandatory}>
          No documents found for this customer. Please upload front and back of the document (camera or photo library). Crop after selecting.
        </Text>
      )}

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Front</Text>
          {existingFront?.file_url && !frontFile ? (
            <TouchableOpacity
              style={styles.thumbWrap}
              onPress={() => setViewImageUrl(existingFront.file_url)}
              activeOpacity={0.8}>
              <Image
                source={{uri: existingFront.file_url}}
                style={styles.thumb}
                resizeMode="cover"
              />
              <Text style={styles.viewText}>Tap to view</Text>
            </TouchableOpacity>
          ) : frontFile?.uri ? (
            <View style={styles.thumbWrap}>
              <Image source={{uri: frontFile.uri}} style={styles.thumb} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>No image</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage('front')}
            disabled={uploading}>
            <Text style={styles.uploadButtonText}>
              {frontFile?.uri ? 'Change front' : 'Upload front'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Back</Text>
          {existingBack?.file_url && !backFile ? (
            <TouchableOpacity
              style={styles.thumbWrap}
              onPress={() => setViewImageUrl(existingBack.file_url)}
              activeOpacity={0.8}>
              <Image
                source={{uri: existingBack.file_url}}
                style={styles.thumb}
                resizeMode="cover"
              />
              <Text style={styles.viewText}>Tap to view</Text>
            </TouchableOpacity>
          ) : backFile?.uri ? (
            <View style={styles.thumbWrap}>
              <Image source={{uri: backFile.uri}} style={styles.thumb} resizeMode="cover" />
            </View>
          ) : (
            <View style={styles.placeholderBox}>
              <Text style={styles.placeholderText}>No image</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage('back')}
            disabled={uploading}>
            <Text style={styles.uploadButtonText}>
              {backFile?.uri ? 'Change back' : 'Upload back'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.proceedButton, !canProceed() && styles.proceedButtonDisabled]}
        onPress={uploadAndProceed}
        disabled={!canProceed() || uploading}>
        {uploading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.proceedButtonText}>Proceed to Step 3</Text>
        )}
      </TouchableOpacity>
    </ScrollView>

    <Modal
      visible={!!viewImageUrl}
      transparent
      animationType="fade"
      onRequestClose={() => setViewImageUrl(null)}>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => setViewImageUrl(null)}
        />
        <View style={styles.modalContent} pointerEvents="box-none">
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalImageWrap}>
            <Image
              source={{uri: viewImageUrl}}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setViewImageUrl(null)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  hintMandatory: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500',
    marginBottom: 20,
  },
  cardsRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    width: isTablet ? CARD_WIDTH : undefined,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    alignSelf: 'center',
    marginBottom: 20,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
    alignSelf: 'center',
  },
  viewText: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  placeholderBox: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  uploadButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignSelf: 'center',
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  proceedButton: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    alignItems: 'center',
  },
  modalImageWrap: {
    width: '100%',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  modalCloseText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentUploadsScreen;
