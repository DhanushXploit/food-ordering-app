// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  StatusBar, TextInput, ActivityIndicator, SafeAreaView, ScrollView,
  Animated, Platform,
} from 'react-native';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts'];

const COLORS = {
  bg: '#0F0F0F',
  card: '#1A1A1A',
  accent: '#FF6B35',
  accentLight: '#FF8C5A',
  gold: '#FFD166',
  text: '#F5F5F5',
  muted: '#888',
  border: '#2A2A2A',
  success: '#06D6A0',
  vegGreen: '#4CAF50',
  nonVegRed: '#F44336',
};

const MenuCard = ({ item, onAdd, cartQty }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onAdd(item)}
      >
        <View style={styles.cardImageWrapper}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          {item.bestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.bestsellerText}>⭐ BESTSELLER</Text>
            </View>
          )}
          <View style={[styles.dietDot, { backgroundColor: item.isVeg ? COLORS.vegGreen : COLORS.nonVegRed }]} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardPrice}>₹{item.price}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={11} color={COLORS.gold} />
                <Text style={styles.metaText}> {item.rating}  ·  {item.prepTime}</Text>
              </View>
            </View>
            {cartQty > 0 ? (
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyBadgeText}>{cartQty} in cart</Text>
              </View>
            ) : (
              <View style={styles.addBtn}>
                <Ionicons name="add" size={20} color={COLORS.bg} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }) {
  const { items, loading, error } = useMenu();
  const { dispatch, cart, totalItems } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const getCartQty = useCallback(
    id => cart.find(i => i.id === id)?.quantity || 0,
    [cart]
  );

  const filtered = items.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = item => dispatch({ type: 'ADD_ITEM', item });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreet}>Good evening 👋</Text>
          <Text style={styles.headerTitle}>What are you craving?</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="bag-outline" size={24} color={COLORS.text} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, category === cat && styles.catChipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.muted} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MenuCard item={item} onAdd={handleAdd} cartQty={getCartQty(item.id)} />
          )}
        />
      )}

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="bag" size={20} color="#fff" />
          <Text style={styles.floatingCartText}>{totalItems} item{totalItems > 1 ? 's' : ''} · View Cart</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 12, paddingBottom: 8,
  },
  headerGreet: { fontSize: 13, color: COLORS.muted, fontFamily: 'System' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  cartBtn: { position: 'relative', padding: 8 },
  cartBadge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: COLORS.accent, borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, marginHorizontal: 20, marginVertical: 12,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, marginLeft: 8, color: COLORS.text, fontSize: 14 },
  catRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, alignItems: 'center', },
  catChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, height: 38, justifyContent: 'center', 
  },
  catChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 12, paddingBottom: 100 },
  card: {
    flex: 1, margin: 6, backgroundColor: COLORS.card,
    borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border,
  },
  cardImageWrapper: { position: 'relative' },
  cardImage: { width: '100%', height: 130 },
  bestsellerBadge: {
    position: 'absolute', bottom: 6, left: 6,
    backgroundColor: COLORS.gold, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  bestsellerText: { fontSize: 9, fontWeight: '800', color: '#000' },
  dietDot: {
    position: 'absolute', top: 8, right: 8,
    width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#fff',
  },
  cardBody: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
  cardDesc: { fontSize: 10, color: COLORS.muted, lineHeight: 14, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardPrice: { fontSize: 15, fontWeight: '800', color: COLORS.accent },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  metaText: { fontSize: 10, color: COLORS.muted },
  addBtn: {
    backgroundColor: COLORS.accent, borderRadius: 10, padding: 6,
  },
  qtyBadge: {
    backgroundColor: COLORS.success + '22', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.success,
  },
  qtyBadgeText: { fontSize: 9, color: COLORS.success, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { color: COLORS.muted, marginTop: 12, fontSize: 13 },
  errorText: { color: COLORS.muted, marginTop: 12, fontSize: 14, textAlign: 'center' },
  emptyText: { color: COLORS.muted, fontSize: 15 },
  floatingCart: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    backgroundColor: COLORS.accent, borderRadius: 16, flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    gap: 10, elevation: 8,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  floatingCartText: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 14 },
});