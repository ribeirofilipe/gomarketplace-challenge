import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveStorageProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }

    saveStorageProducts();
  }, [products]);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      const productExisting = products.find(item => item.id === product.id);

      if (productExisting) {
        setProducts(
          products.map(item => {
            if (item.id === product.id) {
              return {
                ...item,
                quantity: item?.quantity + 1,
              };
            }

            return item;
          }),
        );

        return;
      }

      setProducts([
        ...products,
        {
          ...product,
          quantity: 1,
        },
      ]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(item => {
          if (item.id === id) {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }

          return item;
        }),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const quantity = products.find(item => item.id === id)?.quantity;

      quantity === 1
        ? setProducts(products.filter(item => item.id !== id))
        : setProducts(
            products.map(item => {
              if (item.id === id) {
                return {
                  ...item,
                  quantity: item.quantity - 1,
                };
              }

              return item;
            }),
          );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
