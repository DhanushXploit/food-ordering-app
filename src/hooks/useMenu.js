// src/hooks/useMenu.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useMenu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'menuItems'));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data(), price: Number(doc.data().price) }))
          .filter(item => item.name)  // ← skip docs with no name
          .sort((a, b) => a.name.localeCompare(b.name));
        setItems(data);
        setLoading(false);
      },
      err => {
        console.error('Firestore error:', err);
        setError('Failed to load menu. Please try again.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { items, loading, error };
};