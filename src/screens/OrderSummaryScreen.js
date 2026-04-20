// src/screens/OrderSummaryScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator, Platform, Alert,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  bg: '#0F0F0F', card: '#1A1A1A', accent: '#FF6B35',
  gold: '#FFD166', text: '#F5F5F5', muted: '#888',
  border: '#2A2A2A', success: '#06D6A0', danger: '#FF4757',
};

const ADDRESSES = [
  { id: '1', label: 'Home', address: '12, MG Road, Thanjavur, TN 613001', icon: 'home-outline' },
  { id: '2', label: 'Work', address: '45, Anna Nagar, Chennai, TN 600040', icon: 'business-outline' },
];

export default function OrderSummaryScreen({ navigation, route }) {
  const { grandTotal, tax } = route.params;
  const { cart, dispatch, totalPrice } = useCart();
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const DELIVERY_FEE = 40;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const address = ADDRESSES.find(a => a.id === selectedAddress);
      const docRef = await addDoc(collection(db, 'orders'), {
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
        })),
        itemTotal: totalPrice,
        deliveryFee: DELIVERY_FEE,
        tax,
        grandTotal,
        deliveryAddress: address.address,
        paymentMethod,
        status: 'confirmed',
        createdAt: serverTimestamp(),
      });
      setOrderId(docRef.id.slice(0, 8).toUpperCase());
      setPlaced(true);
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      console.error('Order error:', err);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (placed) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Order Placed! 🎉</Text>
          <Text style={styles.successSubtitle}>Your food is being prepared</Text>
          <View style={styles.orderIdCard}>
            <Text style={styles.orderIdLabel}>ORDER ID</Text>
            <Text style={styles.orderIdValue}>#{orderId}</Text>
          </View>
          <View style={styles.etaCard}>
            <Ionicons name="time-outline" size={18} color={COLORS.gold} />
            <Text style={styles.etaText}>Estimated delivery: 30–40 min</Text>
          </View>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.doneBtnText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Items */}
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        <View style={styles.card}>
          {cart.map((item, idx) => (
            <View key={item.id}>
              <View style={styles.orderItem}>
                <View style={styles.orderQtyBadge}>
                  <Text style={styles.orderQtyText}>{item.quantity}×</Text>
                </View>
                <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
              </View>
              {idx < cart.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        {ADDRESSES.map(addr => (
          <TouchableOpacity
            key={addr.id}
            style={[styles.addrCard, selectedAddress === addr.id && styles.addrCardActive]}
            onPress={() => setSelectedAddress(addr.id)}
          >
            <Ionicons name={addr.icon} size={18} color={selectedAddress === addr.id ? COLORS.accent : COLORS.muted} />
            <View style={styles.addrInfo}>
              <Text style={[styles.addrLabel, selectedAddress === addr.id && { color: COLORS.accent }]}>{addr.label}</Text>
              <Text style={styles.addrText}>{addr.address}</Text>
            </View>
            {selectedAddress === addr.id && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
            )}
          </TouchableOpacity>
        ))}

        {/* Payment */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.card}>
          {[
            { id: 'upi', label: 'UPI / GPay', icon: 'phone-portrait-outline' },
            { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' },
            { id: 'cod', label: 'Cash on Delivery', icon: 'cash-outline' },
          ].map(pm => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.payRow, paymentMethod === pm.id && styles.payRowActive]}
              onPress={() => setPaymentMethod(pm.id)}
            >
              <Ionicons name={pm.icon} size={18} color={paymentMethod === pm.id ? COLORS.accent : COLORS.muted} />
              <Text style={[styles.payLabel, paymentMethod === pm.id && { color: COLORS.accent }]}>{pm.label}</Text>
              {paymentMethod === pm.id && <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Breakup */}
        <Text style={styles.sectionTitle}>Price Breakup</Text>
        <View style={styles.card}>
          {[
            { label: 'Item Total', val: `₹${totalPrice}` },
            { label: 'Delivery Fee', val: `₹${DELIVERY_FEE}` },
            { label: 'Tax (5%)', val: `₹${tax}` },
          ].map(row => (
            <View key={row.label} style={styles.priceRow}>
              <Text style={styles.priceLabel}>{row.label}</Text>
              <Text style={styles.priceVal}>{row.val}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Payable</Text>
          <Text style={styles.footerTotal}>₹{grandTotal}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeBtn, placing && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.placeBtnText}>Place Order</Text>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  content: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.muted, letterSpacing: 1, marginBottom: 10, marginTop: 20, textTransform: 'uppercase' },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 10 },
  orderQtyBadge: {
    backgroundColor: COLORS.accent + '22', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  orderQtyText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },
  orderItemName: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '600' },
  orderItemPrice: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  itemDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 12 },
  addrCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10,
  },
  addrCardActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '11' },
  addrInfo: { flex: 1 },
  addrLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  addrText: { fontSize: 11, color: COLORS.muted, lineHeight: 16 },
  payRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
  },
  payRowActive: { backgroundColor: COLORS.accent + '11' },
  payLabel: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  priceLabel: { color: COLORS.muted, fontSize: 13 },
  priceVal: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 14, marginVertical: 4 },
  totalLabel: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: '900', color: COLORS.accent },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.card, borderTopWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  footerLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  footerTotal: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  placeBtn: {
    backgroundColor: COLORS.accent, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14,
    flexDirection: 'row', gap: 8, alignItems: 'center',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  placeBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.success + '22', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.success, marginBottom: 24,
  },
  successTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 32 },
  orderIdCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, width: '100%', marginBottom: 16,
  },
  orderIdLabel: { fontSize: 10, letterSpacing: 2, color: COLORS.muted, marginBottom: 6 },
  orderIdValue: { fontSize: 28, fontWeight: '900', color: COLORS.accent },
  etaCard: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: COLORS.gold + '11', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.gold + '44', width: '100%',
    marginBottom: 32, justifyContent: 'center',
  },
  etaText: { color: COLORS.gold, fontWeight: '600', fontSize: 13 },
  doneBtn: {
    backgroundColor: COLORS.accent, borderRadius: 16,
    paddingHorizontal: 48, paddingVertical: 15, width: '100%', alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});