# 🍔 Mini Food Ordering App — React Native + Firebase

A fully functional food ordering mobile app built with React Native and Firebase Firestore, developed as part of the Olcademy Mobile Development Internship Assignment.

---

## 📱 Screenshots

| Home Screen | Category Filter | Cart Screen |
|-------------|----------------|-------------|
| All menu items with search | Filter by Starters/Mains/Desserts | Qty controls + Bill breakdown |

| Promo Code | Order Summary | Order Placed |
|------------|--------------|--------------|
| Apply discount codes | Address + Payment selection | Confirmation with Order ID |

---

## ✨ Features

- **Home Screen** — Real-time menu grid fetched from Firestore with search and category filter (All, Starters, Mains, Desserts)
- **Menu Cards** — Food image, name, description, price, rating, prep time, veg/non-veg indicator, bestseller badge
- **Cart Screen** — Add/remove items, quantity controls, promo code support, bill breakdown with taxes
- **Promo Codes** — Working discount system (SAVE10, FLAT50, NEWUSER)
- **Order Summary Screen** — Delivery address selection, payment method selection, price breakup, order placement
- **Order Confirmation** — Unique Order ID, estimated delivery time
- **Firebase Integration** — Real-time Firestore data fetching, order submission to Firestore
- **Loading & Error States** — Proper handling for network issues and data fetching

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| React Native 0.76 | Mobile app framework |
| Expo SDK 55 | Development toolchain |
| Firebase Firestore | Real-time database (menu + orders) |
| React Context API | Global cart state management |
| Custom Hooks | `useMenu` for Firestore data fetching |
| Expo Vector Icons | UI icons |

---

## 🏗️ Project Structure

```
FoodApp/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js        # Menu grid, search, category filter
│   │   ├── CartScreen.js        # Cart items, promo code, bill summary
│   │   └── OrderSummaryScreen.js # Address, payment, order placement
│   ├── context/
│   │   └── CartContext.js       # Global cart state with useReducer
│   ├── hooks/
│   │   └── useMenu.js           # Firestore real-time menu fetching
│   └── firebase/
│       ├── config.js            # Firebase initialization
│       └── seedMenu.js          # Menu data seeder script
├── app.js                       # Root component + navigation setup
├── app.json                     # Expo config
└── package.json
```

---

## 🔥 Firebase Setup

- **Project:** `foodapp-olcademy`
- **Database:** Cloud Firestore (asia-south1)
- **Collections:**
  - `menuItems` — 10 menu items with image, price, category, rating, prepTime, isVeg, bestseller fields
  - `orders` — stores placed orders with items, address, payment, total, timestamp

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for emulator) or Expo Go app

### Installation

```bash
# Clone the repository
git clone https://github.com/DhanushXploit/food-ordering-app.git
cd food-ordering-app

# Install dependencies
npm install

# Start the development server
npx expo start

# Press 'a' to open on Android emulator
```

---

## 📦 Menu Items

| Item | Category | Price |
|------|----------|-------|
| Veggie Delight Pizza | Mains | ₹299 |
| BBQ Chicken Wings | Starters | ₹229 |
| Cheesy Chicken Burger | Mains | ₹199 |
| Chicken Tacos | Mains | ₹219 |
| Chocolate Lava Cake | Desserts | ₹149 |
| Chocolate Milkshake | Desserts | ₹139 |
| Creamy Alfredo Pasta | Mains | ₹249 |
| Spicy Dragon Ramen | Mains | ₹249 |
| Paneer Tikka | Starters | ₹199 |
| Cold Coffee | Desserts | ₹129 |

---

## 💡 Promo Codes

| Code | Discount |
|------|----------|
| SAVE10 | ₹10 off |
| FLAT50 | ₹50 off |
| NEWUSER | ₹20 off |

---

## 👨‍💻 Developer

**Dhanush** — B.Tech CSE  
GitHub: [@DhanushXploit](https://github.com/DhanushXploit)  
Internship Assignment: Olcademy — React Native Developer
