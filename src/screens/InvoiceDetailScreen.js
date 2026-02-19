import React, {useState, useCallback, useLayoutEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {Colors} from '../constants';
import {getAgreementPreview, getInvoiceDetails} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {hasSeenSplashRef} from '../navigation/navRefs';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;
const CARD_PADDING = isTablet ? 20 : 16;
const CARD_RADIUS = 16;

const Row = ({label, value}) =>
  value != null && value !== '' ? (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>{String(value)}</Text>
    </View>
  ) : null;

const Card = ({title, icon, children}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      {icon ? <Text style={styles.cardIcon}>{icon}</Text> : null}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const InvoiceDetailScreen = ({route, navigation}) => {
  const {token, logout} = useAuth();
  const invoice = route.params?.invoice ?? {};
  const customer = invoice.customer ?? {};
  const amounts = invoice.amounts ?? {};
  const payment = invoice.payment ?? {};
  const steps = invoice.steps ?? {};
  const pdfUrl = invoice.pdf_url || invoice.qr_code;
  const invoiceNumber = invoice.invoice_number;
  const isStepIncomplete = steps?.is_completed === false;
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!invoiceNumber || refreshing) return;
    setRefreshing(true);
    const result = await getInvoiceDetails(
      {invoice_number: invoiceNumber},
      token ? {token} : {},
    );
    setRefreshing(false);
    if (result.success && result.data) {
      navigation.setParams({invoice: result.data});
    } else {
      Alert.alert('Error', result.message || 'Could not refresh invoice.');
    }
  }, [invoiceNumber, token, navigation, refreshing]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtonsWrap}>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            activeOpacity={0.7}
            style={[styles.headerBtn, styles.headerBtnRefresh]}>
            {refreshing ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <Text style={styles.headerBtnRefreshLabel}>Refresh</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              hasSeenSplashRef.current = true;
              logout();
            }}
            activeOpacity={0.7}
            style={[styles.headerBtn, styles.headerBtnLogout]}>
            <Text style={styles.headerBtnLogoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, handleRefresh, refreshing, logout]);

  const openAgreementPreview = async () => {
    if (!invoiceNumber) return;
    setLoadingAgreement(true);
    const result = await getAgreementPreview(
      {invoice_number: invoiceNumber},
      token ? {token} : {},
    );
    setLoadingAgreement(false);
    if (result.success && result.data) {
      const customerId = invoice.customer_id ?? invoice.customer?.id ?? null;
      navigation.navigate('AgreementPreview', {
        agreementData: result.data,
        invoiceNumber,
        customerId,
      });
    } else {
      Alert.alert('Error', result.message || 'Could not load agreement.');
    }
  };

  const openPdfInApp = () => {
    const url = pdfUrl?.trim();
    if (!url) return;
    navigation.navigate('PdfViewer', {url, title: `Invoice ${invoice.invoice_number || ''}`});
  };

  const statusLabel = invoice.status_label || '';
  const isPaid = /bezahlt|paid|complete/i.test(statusLabel);

  const paymentMethods = (() => {
    const methodStr = payment.payment_method || payment.payment_mode || '';
    const amounts = [
      payment.first_payment_amount,
      payment.second_payment_amount,
      payment.third_payment_amount,
    ].filter(a => a != null && String(a).trim() !== '');
    const methods = methodStr
      ? methodStr.split(',').map(m => m.trim()).filter(Boolean)
      : payment.payment_mode
        ? [payment.payment_mode]
        : [];
    return methods.map((method, i) => ({
      method,
      amount: amounts[i] != null ? amounts[i] : '',
    }));
  })();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {/* Hero header */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.heroLabel}>Invoice</Text>
          <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}>
            <Text style={styles.statusBadgeText}>{statusLabel || '—'}</Text>
          </View>
        </View>
        <Text style={styles.heroNumber}>{invoice.invoice_number || '—'}</Text>
        <Text style={styles.heroDate}>{invoice.date || ''}</Text>
      </View>

      {/* Customer card */}
      <Card title="Customer" icon="👤">
        <Row label="Name" value={customer.name} />
        <Row label="Phone" value={customer.phone} />
        <Row label="Address" value={customer.address} />
      </Card>

      {/* Amounts card */}
      <Card title="Amounts" icon="💰">
        <Row label="Final total" value={amounts.final_total} />
        <Row label="Paid amount" value={amounts.paid_amount} />
        <Row label="Last balance" value={amounts.last_balance} />
        <Row label="Discount" value={amounts.discount} />
        <Row label="Total VAT" value={amounts.total_vat} />
      </Card>

      {/* Payment card */}
      <Card title="Payment" icon="💳">
        {paymentMethods.length > 0
          ? paymentMethods.map((item, index) => (
              <Row
                key={`payment-${index}`}
                label={item.method || `Payment ${index + 1}`}
                value={item.amount}
              />
            ))
          : <Row label="Mode" value={payment.payment_mode} />}
      </Card>

      {steps.current_step != null && (
        <Card title="Progress" icon="📋">
          <Row
            label="Step"
            value={`${steps.current_step} • ${steps.is_completed ? 'Completed' : 'In progress'}`}
          />
        </Card>
      )}

      {/* PDF in-app */}
      {pdfUrl ? (
        <View style={styles.pdfCard}>
          <Text style={styles.cardTitle}>Invoice PDF</Text>
          <Text style={styles.pdfCardHint}>View the full invoice document.</Text>
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={openPdfInApp}
            activeOpacity={0.85}>
            <Text style={styles.pdfButtonIcon}>📄</Text>
            <Text style={styles.pdfButtonText}>View Invoice PDF</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Next step or completed */}
      <View style={styles.footer}>
        {isStepIncomplete ? (
          <>
            <Text style={styles.footerNote}>
              Step 1 – Invoice summary. Next: sign the agreement.
            </Text>
            <TouchableOpacity
              style={styles.agreementButton}
              onPress={openAgreementPreview}
              disabled={loadingAgreement}
              activeOpacity={0.85}>
              {loadingAgreement ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.agreementButtonText}>Continue to Agreement</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ All steps completed</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 48,
  },
  headerButtonsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: -4,
  },
  headerBtn: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
    marginRight: 3,
    
  },
  headerBtnRefresh: {
    backgroundColor: '#E8ECF1',
    minWidth: 88,
  },
  headerBtnRefreshLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerBtnLogout: {
    backgroundColor: Colors.primary,
    minWidth: 80,
  },
  headerBtnLogoutLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  hero: {
    backgroundColor: Colors.primary,
    marginHorizontal: -CARD_PADDING,
    marginTop: -CARD_PADDING,
    marginBottom: 20,
    paddingVertical: 28,
    paddingHorizontal: CARD_PADDING + 16,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {elevation: 6},
    }),
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPaid: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statusPending: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  heroNumber: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  heroDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {elevation: 3},
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 12,
  },
  rowLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 0.38,
  },
  rowValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 0.62,
    textAlign: 'right',
  },
  pdfCard: {
    backgroundColor: Colors.white,
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {elevation: 3},
    }),
  },
  pdfCardHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  pdfButtonIcon: {
    fontSize: 20,
  },
  pdfButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  agreementButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  agreementButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  completedBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
});

export default InvoiceDetailScreen;
