import { useState, createContext, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  push,
  child,
  remove,
} from "firebase/database";
import { initializeApp } from "firebase/app";
import { balance } from "./cart-utils/getTime";
import { number } from "yup/lib/locale";
// import calculateTime from "./cart-utils/balance-stoves";
import { calculateTime } from "./cart-utils/balance-stoves";
import { calculateOrderReadyTime } from "./cart-utils/calculateOrderReadyTime";

//calculate ongoing order time in balance-stoves for sortedOldOrders[0]
//  for app to function correctly chef must mark items complete, write separate function for submitting orders in advance
// call orderReadyTime from cart to show when cart will be ready 


const firebaseConfig = {
  apiKey: "AIzaSyA1oL-kZSAuizXIH5lCiGMJmxBqJ26ZMAk",
  authDomain: "thai-calculator.firebaseapp.com",
  databaseURL: "https://thai-calculator-default-rtdb.firebaseio.com",
  projectId: "thai-calculator",
  storageBucket: "thai-calculator.appspot.com",
  messagingSenderId: "1031090262907",
  appId: "1:1031090262907:web:7c4a5b38650205fc0ee3de",
  measurementId: "G-9ZKH40PXLV",
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const ordersRef = ref(database, "recentOrders");

const CartContext = createContext({
  cart: [],
  orders: [],
  latestOrderReadyTime: number,
  // total: 0,
  addItem: (item) => { },
  addToOrders: () => { },
  fetchOrders: () => { },
  addToArchive: () => { },
  deleteOrder: () => { },
  deleteCartItem: () => { },
  editCartItem: () => { },
  calculateTotal: () => { },
});

export const CartContextProvider = (props) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  // const [latestOrderReadyTime, setLatestOrderReadyTime] = useState(0)

  const router = useRouter();

  useEffect(() => {
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();

      if (data != undefined || data != null) {
        const orders = Object.entries(data).map(([id, obj]) => ({
          id,
          ...obj,
        }));

        setOrders(orders);
      } else {
        setOrders([]);
      }
    });
  }, []);

  const deleteCartItem = (item) => {
    const itemIndex = cart.findIndex(i => i.id === item.id)
    const cartCopy = [...cart];
    cartCopy.splice(itemIndex, 1);

    setCart(cartCopy)
  }

  const editCartItem = (item, prevItem) => {
    const itemIndex = cart.findIndex(i => i.id === item.id)

    const cartCopy = [...cart]
    cartCopy.splice(itemIndex, 1, item)

    setCart(cartCopy)
  }

  const getTime = (name, scheduledTime) => {
    console.log('cart-context getTime')
    const currentOrderKey = name + Date.now();


    const sortedOldOrders = orders.filter((o) => o.status === "ongoing").sort((a, b) => {
      return a.timePlacedMilliseconds - b.timePlacedMilliseconds;
    })
    console.log('orders', filteredOrders);
    // let stoveA = [],
    //   stoveB = [];
    // fryer = [],
    // oven = [],
    // grill = [];

    // for (const oldOrder of filteredOrders) {
    //   const orderKey = oldOrder.name + Date.now();
    //   const [readyTime, updatedStoveA, updatedStoveB] =  calculateTime(
    //     stoveA,
    //     stoveB,
    //     // fryer,
    //     // oven,
    //     // grill
    //     oldOrder.items.sort((a, b) => b.time - a.time),
    //     oldOrder.timePlacedMilliseconds,
    //     oldOrder.scheduledTime,
    //   );
    //   stoveA = updatedStoveA;
    //   stoveB = updatedStoveB;
    //   // latestOrderReadyTime.current = readyTime;
    // }

    const currentOrder = cart
      .map((item) => new Array(item.quantity).fill(item))
      .reduce((acc, arr) => [...acc, ...arr], [])
      .sort((a, b) => b.time - a.time);

    const [orderReadyTimeMinutes] = calculateTime(
      // stoveA,
      // stoveB,
      // currentOrderKey,
      // individualItems,
      // Date.now(),
      // scheduledTime,
      sortedOldOrders,
      currentOrder,
    );



    // setLatestOrderReadyTime(orderReady);

    const [orderReadyTimeMilliseconds, orderReadyTimeString] = calculateOrderReadyTime(orderReadyTimeMinutes)

    return [orderReadyTimeMilliseconds, orderReadyTimeString];
  };

  const calculateTotal = () => {
    const total = cart.reduce((acc, item) => acc + (item.itemPrice * item.quantity), 0)

    let totalWithFees = 0
    if (total < 5) {
      totalWithFees = total + .5;
    } else {
      totalWithFees = total
    }

    const tax = totalWithFees * 0.094;
    const totalPlusTax = (tax + totalWithFees).toFixed(2);
    return { tax, totalPlusTax }
  }


  const addItem = (item) => {
    if (window.DEBUG) {
      const itemIndex = cart.findIndex(item => item.id === itemId)
      debugger;
    }
    setCart((state) => [...state, item]);
  };

  const addToOrders = async (name, scheduledTime) => {

    const [timeReadyMilliseconds, timeReady] = getTime(name, scheduledTime);
    const { tax, totalPlusTax } = calculateTotal();

    const order = {
      items: cart,
      timePlaced: new Date().toLocaleTimeString(
        [], { hour: "2-digit", minute: "2-digit" }
      ),
      timeReady,
      timeReadyMilliseconds,
      tax: tax.toFixed(2),
      totalPlusTax,
      name,
      status: "ongoing",
    };

    await push(child(ref(database), "recentOrders"), order);
    setCart([]);
    router.push("/Orders");
  };

  const markOrderComplete = (id) => {
    return update(ref(database), {
      [`/recentOrders/${id}/status`]: "completed",
    });
  };

  const addToArchive = async () => {
    await push(child(ref(database), "archivedOrders"), orders);
    await remove(ordersRef);
    router.push("/");
  };

  const deleteOrder = (id) => {
    set(ref(database, `/recentOrders/${id}`), null);
  };

  const contextValue = {
    cart,
    orders,
    latestOrderReadyTime: latestOrderReadyTime,
    addItem,
    addToOrders,
    markOrderComplete,
    addToArchive,
    deleteOrder,
    deleteCartItem,
    editCartItem,
    calculateTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {props.children}
    </CartContext.Provider>
  );
};

export default CartContext;

// extras is an array

// onValue = ref + callback
// internally, firebase tracks this via:
// let listerners
// onValue(ref, cb) = {
//   listeners.push([ref, cb])
// }
// onSocketData((data) => { if (data.ref === ref) { cb(data} })
