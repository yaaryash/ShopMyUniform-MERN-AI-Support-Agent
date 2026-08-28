import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // any time cart changes, write it to localStorage so it survives a refresh
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id && i.size === size);
      if (existing) {
        // same product + same size already in cart — just bump the quantity
        return prev.map((i) =>
          i.productId === product._id && i.size === size ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        { productId: product._id, name: product.name, price: product.price, size, quantity },
      ];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    setCart((prev) =>
      prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);