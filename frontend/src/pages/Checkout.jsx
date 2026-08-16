import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart, removeFromCart } from '../redux/cartSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const singleItems = location.state?.items;
  const orderItems = singleItems && singleItems.length > 0 ? singleItems : cartItems;

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });
  const [loading, setLoading] = useState(false);

  const totalPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: totalPrice,
          address
        })
      });

      if (!orderRes.ok) {
        alert('Could not create order');
        setLoading(false);
        return;
      }

      const createdOrder = await orderRes.json();

      const initRes = await fetch('/api/payment/esewa-initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          orderId: createdOrder._id,
          amount: totalPrice
        })
      });

      const initData = await initRes.json();

      if (!initData.success) {
        alert('Payment initialization failed: ' + initData.message);
        setLoading(false);
        return;
      }

      if (singleItems && singleItems.length > 0) {
        singleItems.forEach((item) => dispatch(removeFromCart(item.productId)));
      } else {
        dispatch(clearCart());
      }
      submitToEsewa(initData.paymentData);
      // no setLoading(false) here — page is about to redirect to eSewa
    } catch (error) {
      console.error(error);
      alert('Something went wrong starting payment');
      setLoading(false);
    }
  };

  const submitToEsewa = (paymentData) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rc.esewa.com.np/api/epay/main/v2/form';

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login first');
      navigate('/login');
      return;
    }
    if (orderItems.length === 0) {
      alert('No items to check out');
      navigate('/cart');
      return;
    }
    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} disabled={loading} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} disabled={loading} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} disabled={loading} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} disabled={loading} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} disabled={loading} />
          <div className="checkout-summary">
            <h4>MRP {totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing...' : 'Pay with eSewa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;