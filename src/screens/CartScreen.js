// src/screens/CartScreen.js
import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Platform,
  TextInput, Modal, KeyboardAvoidingView,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#0F0F0F', card: '#1A1A1A', accent: '#FF6B35',
  gold: '#FFD166', text: '#F5F5F5', muted: '#888',
  border: '#2A2A2A', success: '#06D6A0', danger: '#FF4757',
};

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

const VALID_CODES = {
  'SAVE10': 10,
  'FLAT50': 50,
  'NEWUSER': 20,
};

export default function CartScreen({ navigation }) {
  const { cart, dispatch, totalPrice } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoVisible, setPromoVisible] = useState(false);

  const tax = Math.round((totalPrice - discount) * TAX_RATE);
  const grandTotal = totalPrice - discount + DELIVERY_FEE + tax;

  const isEmpty = cart.length === 0;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_CODES[code]) {
      setDiscount(VALID_CODES[code]);
      setAppliedCode(code);
      setPromoError('');
      setPromoVisible(false);
    } else {
      setPromoError('Invalid promo code. Try SAVE10, FLAT50 or NEWUSER');
    }
  };

  const handleRemovePromo = () => {
    setAppliedCode(null);
    setDiscount(0);
    setPromoCode('');
    setPromoError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        {!isEmpty && (
          <TouchableOpacity onPress={() => dispatch({ type: 'CLEAR_CART' })}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some delicious items from the menu</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentWrapper}>
          {/* Cart Items */}
          <FlatList
            data={cart}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
                  <Text style={styles.itemSubtotal}>₹{item.price * item.quantity}</Text>
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch({ type: 'DECREMENT', id: item.id })}
                  >
                    <Ionicons
                      name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                      size={15}
                      color={item.quantity === 1 ? COLORS.danger : COLORS.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, styles.qtyBtnActive]}
                    onPress={() => dispatch({ type: 'INCREMENT', id: item.id })}
                  >
                    <Ionicons name="add" size={15} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListFooterComponent={
              appliedCode ? (
                <View style={styles.promoApplied}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.promoAppliedText}>"{appliedCode}" applied — ₹{discount} off!</Text>
                  <TouchableOpacity onPress={handleRemovePromo}>
                    <Ionicons name="close-circle" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.promoRow}
                  onPress={() => setPromoVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pricetag-outline" size={16} color={COLORS.gold} />
                  <Text style={styles.promoText}>Apply promo code</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
                </TouchableOpacity>
              )
            }
          />

          {/* Bill Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Bill Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryValue}>₹{totalPrice}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: COLORS.success }]}>Discount</Text>
                <Text style={[styles.summaryValue, { color: COLORS.success }]}>- ₹{discount}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes & Charges (5%)</Text>
              <Text style={styles.summaryValue}>₹{tax}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{grandTotal}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('OrderSummary', { grandTotal, tax })}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Promo Code Modal */}
      <Modal visible={promoVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={styles.modalBg} onPress={() => setPromoVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Apply Promo Code</Text>
            <Text style={styles.modalHint}>Try: SAVE10 · FLAT50 · NEWUSER</Text>
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor={COLORS.muted}
                value={promoCode}
                onChangeText={t => { setPromoCode(t); setPromoError(''); }}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {promoError ? (
              <Text style={styles.promoError}>{promoError}</Text>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 12, paddingBottom: 16,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  clearText: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },

  contentWrapper: { flex: 1 },

  listContent: { paddingHorizontal: 20, paddingBottom: 16 },
  cartItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  itemImage: { width: 60, height: 60, borderRadius: 12 },
  itemInfo: { flex: 1, paddingHorizontal: 12 },
  itemName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  itemPrice: { fontSize: 11, color: COLORS.muted, marginBottom: 3 },
  itemSubtotal: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    backgroundColor: COLORS.border, borderRadius: 8,
    width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnActive: { backgroundColor: COLORS.accent },
  qtyText: { fontSize: 14, fontWeight: '800', color: COLORS.text, minWidth: 16, textAlign: 'center' },

  promoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.gold + '44', marginTop: 4,
  },
  promoText: { flex: 1, color: COLORS.gold, fontSize: 13, fontWeight: '600' },
  promoApplied: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.success + '15', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.success + '44', marginTop: 4,
  },
  promoAppliedText: { flex: 1, color: COLORS.success, fontSize: 13, fontWeight: '600' },

  summary: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: COLORS.muted, fontSize: 13 },
  summaryValue: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 17, fontWeight: '900', color: COLORS.accent },
  checkoutBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
    paddingVertical: 16, marginTop: 16,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  checkoutText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginBottom: 28 },
  browseBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { flex: 1 },
  modalSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 1, borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  modalHint: { fontSize: 12, color: COLORS.muted, marginBottom: 16 },
  promoInputRow: { flexDirection: 'row', gap: 10 },
  promoInput: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  applyBtn: {
    backgroundColor: COLORS.accent, borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  promoError: { color: COLORS.danger, fontSize: 12, marginTop: 10 },
});