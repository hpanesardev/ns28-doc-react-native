import React, {useState, useCallback, useLayoutEffect} from 'react';
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
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Colors} from '../constants';
import {useAuth} from '../context/AuthContext';
import {getProductType, uploadProductImages} from '../services/api';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;
const THUMB_SIZE = 100;

const METAL_TYPES = [
  {label: 'Gold', value: 'gold'},
  {label: 'Silver', value: 'silver'},
];

const MODULE_TYPES = [
  {label: 'Gram Module', value: 'gram'},
  {label: 'Piece Module', value: 'piece'},
];

const UploadProductImagesScreen = ({route, navigation}) => {
  const {invoiceNumber} = route.params ?? {};
  const {token} = useAuth();

  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState(null);
  const [loadingProductTypes, setLoadingProductTypes] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Override back button to navigate to DocumentUploadsScreen
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const addProduct = useCallback(() => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        metalType: null,
        productId: null,
        productName: null,
        module: null,
        images: [],
        productTypes: [],
        loadingTypes: false,
      },
    ]);
  }, []);

  const removeProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const updateProduct = useCallback((productId, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? {...p, ...updates} : p)),
    );
  }, []);

  const loadProductTypes = useCallback(
    async (productId, metalType) => {
      if (!invoiceNumber || !metalType) return;

      setLoadingProductTypes((prev) => ({...prev, [productId]: true}));
      updateProduct(productId, {loadingTypes: true, productTypes: []});

      const result = await getProductType(
        {invoice_number: invoiceNumber, metal_type: metalType},
        token ? {token} : {},
      );

      setLoadingProductTypes((prev) => ({...prev, [productId]: false}));
      updateProduct(productId, {loadingTypes: false});

      if (result.success && result.data) {
        const productTypes = Array.isArray(result.data)
          ? result.data
          : result.data.products || result.data.product_types || [];
        updateProduct(productId, {
          productTypes,
          productId: null,
          productName: null,
        });
      } else {
        Alert.alert('Error', result.message || 'Failed to load product types.');
      }
    },
    [invoiceNumber, token, updateProduct],
  );

  const handleMetalTypeChange = useCallback(
    (productId, metalType) => {
      updateProduct(productId, {
        metalType,
        productId: null,
        productName: null,
        productTypes: [],
      });
      loadProductTypes(productId, metalType);
    },
    [updateProduct, loadProductTypes],
  );

  const handleProductSelect = useCallback(
    (productId, selectedProduct) => {
      updateProduct(productId, {
        productId: selectedProduct.product_id || selectedProduct.id,
        productName: selectedProduct.product_name || selectedProduct.name,
      });
    },
    [updateProduct],
  );

  const pickImage = useCallback(
    (productId, imageIndex = null) => {
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

        const toFile = (img) => {
          const uri =
            img.path && !String(img.path).startsWith('file://')
              ? `file://${img.path}`
              : img.path || '';
          return {
            uri,
            type: img.mime || 'image/jpeg',
            name: img.filename || `product_${productId}_${Date.now()}.jpg`,
          };
        };

        const setImage = (img) => {
          const product = products.find((p) => p.id === productId);
          if (!product) return;

          if (imageIndex !== null && imageIndex < product.images.length) {
            // Replace existing image
            const newImages = [...product.images];
            newImages[imageIndex] = toFile(img);
            updateProduct(productId, {images: newImages});
          } else {
            // Add new image
            updateProduct(productId, {images: [...product.images, toFile(img)]});
          }
        };

        if (isCamera) {
          ImageCropPicker.openCamera(opts)
            .then(setImage)
            .catch((e) => {
              if (e?.code !== 'E_PICKER_CANCELLED') {
                Alert.alert('Error', e?.message || 'Failed to capture image.');
              }
            });
        } else {
          ImageCropPicker.openPicker(opts)
            .then(setImage)
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
    },
    [products, updateProduct],
  );

  const removeImage = useCallback(
    (productId, imageIndex) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const newImages = product.images.filter((_, idx) => idx !== imageIndex);
      updateProduct(productId, {images: newImages});
    },
    [products, updateProduct],
  );

  const canSubmit = useCallback(() => {
    if (products.length === 0) return false;
    return products.every(
      (p) =>
        p.metalType &&
        p.productId &&
        p.productName &&
        p.module &&
        p.images.length > 0,
    );
  }, [products]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit() || !invoiceNumber) {
      Alert.alert(
        'Validation Error',
        'Please complete all products with metal type, product selection, module, and at least one image.',
      );
      return;
    }

    setUploading(true);

    const productsData = products.map((p) => ({
      product_id: p.productId,
      product_name: p.productName,
      type: p.module, // module: gram or piece
      metal_name: p.metalType, // metal: gold or silver
    }));

    const imageFiles = products.map((p) => p.images);

    // Detailed console log for request structure
    console.log('=== UPLOAD PRODUCT IMAGES REQUEST ===');
    console.log('invoice_number:', invoiceNumber);
    console.log('\nProducts:');
    productsData.forEach((product, index) => {
      console.log(`products[${index}][product_id]:`, product.product_id);
      console.log(`products[${index}][product_name]:`, product.product_name);
      console.log(`products[${index}][type]:`, product.type);
      console.log(`products[${index}][metal_name]:`, product.metal_name);
      console.log(`image_files_${index}[]:`, `${imageFiles[index]?.length || 0} image(s)`);
      console.log('');
    });
    console.log('=====================================\n');

    const result = await uploadProductImages(
      {
        invoice_number: invoiceNumber,
        products: productsData,
        imageFiles,
      },
      token ? {token} : {},
    );

    // Detailed console log for response
    console.log('=== UPLOAD PRODUCT IMAGES RESPONSE ===');
    console.log('Success:', result.success);
    if (result.success) {
      console.log('Response Data:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('Error Message:', result.message);
    }
    console.log('=====================================\n');

    setUploading(false);

    if (result.success) {
      Alert.alert('Success', 'Product images uploaded successfully.', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back or to next step
            navigation.goBack();
          },
        },
      ]);
    } else {
      Alert.alert('Upload failed', result.message || 'Could not upload product images.');
    }
  }, [products, invoiceNumber, token, canSubmit, navigation]);

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}>
        <Text style={styles.subtitle}>Invoice: {invoiceNumber || '—'}</Text>
        <Text style={styles.hint}>
          Add products and upload images for each. Select metal type, product, module, and add
          images.
        </Text>

        {products.map((product, index) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle}>Product {index + 1}</Text>
              {products.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeProduct(product.id)}
                  style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Metal Type Selection */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Metal Type *</Text>
              <View style={styles.optionsRow}>
                {METAL_TYPES.map((mt) => (
                  <TouchableOpacity
                    key={mt.value}
                    style={[
                      styles.optionButton,
                      product.metalType === mt.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleMetalTypeChange(product.id, mt.value)}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        product.metalType === mt.value && styles.optionButtonTextSelected,
                      ]}>
                      {mt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Product Type/Name Selection */}
            {product.metalType && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Product *</Text>
                {product.loadingTypes ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading products...</Text>
                  </View>
                ) : product.productTypes.length > 0 ? (
                  <>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => {
                        setOpenDropdownId(product.id);
                        setSearchQuery('');
                      }}>
                      <Text
                        style={[
                          styles.dropdownButtonText,
                          !product.productId && styles.dropdownButtonPlaceholder,
                        ]}>
                        {product.productName || 'Select a product'}
                      </Text>
                      <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                    {product.productId && (
                      <Text style={styles.selectedText}>
                        Selected: {product.productName}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.emptyText}>No products available</Text>
                )}
              </View>
            )}

            {/* Module Selection */}
            {product.productId && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Module *</Text>
                <View style={styles.optionsRow}>
                  {MODULE_TYPES.map((mod) => (
                    <TouchableOpacity
                      key={mod.value}
                      style={[
                        styles.optionButton,
                        product.module === mod.value && styles.optionButtonSelected,
                      ]}
                      onPress={() => updateProduct(product.id, {module: mod.value})}>
                      <Text
                        style={[
                          styles.optionButtonText,
                          product.module === mod.value && styles.optionButtonTextSelected,
                        ]}>
                        {mod.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Images */}
            {product.module && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Product Images *</Text>
                <View style={styles.imagesContainer}>
                  {product.images.map((img, imgIdx) => (
                    <View key={imgIdx} style={styles.imageWrapper}>
                      <Image source={{uri: img.uri}} style={styles.imageThumb} />
                      <TouchableOpacity
                        style={styles.imageRemoveButton}
                        onPress={() => removeImage(product.id, imgIdx)}>
                        <Text style={styles.imageRemoveText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={() => pickImage(product.id)}>
                    <Text style={styles.addImageText}>+ Add Image</Text>
                  </TouchableOpacity>
                </View>
                {product.images.length === 0 && (
                  <Text style={styles.hintText}>At least one image is required</Text>
                )}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addProductButton} onPress={addProduct}>
          <Text style={styles.addProductText}>+ Add Product</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit() || uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Upload Product Images</Text>
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

      {/* Product Dropdown Modal */}
      <Modal
        visible={openDropdownId !== null}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {
          setOpenDropdownId(null);
          setSearchQuery('');
        }}>
        <SafeAreaView style={styles.dropdownModalContainer}>
          <KeyboardAvoidingView
            style={styles.dropdownModalKeyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <View style={styles.dropdownModalContent}>
              <View style={styles.dropdownModalHeader}>
                <Text style={styles.dropdownModalTitle}>Select Product</Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpenDropdownId(null);
                    setSearchQuery('');
                  }}
                  style={styles.dropdownModalClose}>
                  <Text style={styles.dropdownModalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              {openDropdownId !== null && (
                <>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search products..."
                      placeholderTextColor={Colors.textLight}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus={true}
                    />
                  </View>
                  <FlatList
                    data={(() => {
                      const product = products.find((p) => p.id === openDropdownId);
                      if (!product || !product.productTypes) return [];
                      if (!searchQuery.trim()) return product.productTypes;
                      const query = searchQuery.toLowerCase();
                      return product.productTypes.filter(
                        (pt) =>
                          (pt.name || '').toLowerCase().includes(query) ||
                          (pt.product_name || '').toLowerCase().includes(query),
                      );
                    })()}
                    keyExtractor={(item, index) =>
                      `${item.product_id || item.id || index}-${openDropdownId}`
                    }
                    renderItem={({item: pt}) => {
                      const product = products.find((p) => p.id === openDropdownId);
                      const isSelected = product?.productId === (pt.product_id || pt.id);
                      return (
                        <TouchableOpacity
                          style={[
                            styles.dropdownModalItem,
                            isSelected && styles.dropdownModalItemSelected,
                          ]}
                          onPress={() => {
                            handleProductSelect(openDropdownId, pt);
                            setOpenDropdownId(null);
                            setSearchQuery('');
                          }}>
                          <Text
                            style={[
                              styles.dropdownModalItemText,
                              isSelected && styles.dropdownModalItemTextSelected,
                            ]}>
                            {pt.name || pt.product_name || 'Unknown Product'}
                          </Text>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                      );
                    }}
                    ListEmptyComponent={
                      <View style={styles.dropdownEmptyContainer}>
                        <Text style={styles.dropdownEmptyText}>
                          {searchQuery.trim()
                            ? 'No products found matching your search'
                            : 'No products available'}
                        </Text>
                      </View>
                    }
                    style={styles.dropdownList}
                    keyboardShouldPersistTaps="handled"
                  />
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  removeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.error,
    borderRadius: 6,
  },
  removeButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionButtonTextSelected: {
    color: Colors.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownButtonPlaceholder: {
    color: Colors.textLight,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  selectedText: {
    fontSize: 14,
    color: Colors.success,
    marginTop: 8,
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  imageThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addImageButton: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  addImageText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  hintText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  addProductButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addProductText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: Colors.primary,
    fontWeight: '600',
  },
  dropdownModalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  dropdownModalKeyboardView: {
    flex: 1,
  },
  dropdownModalContent: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dropdownModalClose: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModalCloseText: {
    fontSize: 24,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  dropdownList: {
    flex: 1,
  },
  dropdownModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dropdownModalItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownModalItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownModalItemTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  dropdownEmptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    fontSize: 15,
    color: Colors.textLight,
    textAlign: 'center',
  },
});

export default UploadProductImagesScreen;
