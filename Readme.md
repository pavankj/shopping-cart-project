# Shopping Cart Application

## Overview

A simple yet functional shopping cart application built with vanilla JavaScript using the MVC (Model-View-Controller) architecture pattern. The application allows users to manage items in their shopping cart with real-time updates and persistent data storage.

## Features

### Inventory Management

- Display available items with their names
- Adjust quantity using + and - buttons
- Add items to cart with specified quantities
- Maintains selected quantities until added to cart

### Shopping Cart

- View all items added to cart with their quantities
- Edit item quantities with + and - buttons
- Delete items from cart
- Save changes after editing
- Checkout functionality to clear cart
- Persistent cart data across page refreshes

## Setup Instructions

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

This will start both:

- JSON server on port 3000 for the backend
- Live server for the frontend

4. Open http://localhost:3000 in your browser

## Technical Details

### Architecture

The application follows the MVC pattern:

- **Model**: Handles data and business logic
- **View**: Manages the UI and user interactions
- **Controller**: Coordinates between Model and View

### Data Structure

```javascript
// Inventory Item
{
  "id": number,
  "content": string
}

// Cart Item
{
  "id": number,
  "content": string,
  "amount": number
}
```

### API Endpoints

- GET /inventory - Fetch all inventory items
- GET /cart - Fetch cart items
- POST /cart - Add item to cart
- PATCH /cart/:id - Update cart item
- DELETE /cart/:id - Remove item from cart

## File Structure

```
├── index.html
├── style.css
├── index.js
└── db
    └── db.json
```

## Key Components

### Index.js

Contains the main application logic divided into:

- API Module: Handles all server communications
- Model: Manages application state
- View: Renders UI components
- Controller: Handles user interactions

### Style.css

Contains all styling including:

- Layout styling
- Component styling
- Button designs
- Responsive adjustments

### db.json

Stores the application data:

- Inventory items
- Cart items

## Usage

1. **Adding Items to Cart**:

   - Use +/- buttons to select quantity
   - Click "add to cart" to add items
   - Quantity resets after adding

2. **Managing Cart Items**:
   - Edit: Modify quantities with +/- buttons
   - Save: Confirm quantity changes
   - Delete: Remove items from cart
   - Checkout: Clear entire cart
