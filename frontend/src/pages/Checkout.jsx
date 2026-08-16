import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', postalCode: '', country: ''
  });

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePayment = async () => {
    try {
      // 1. Create the order first (unpaid) so we have an orderId to pass to eSewa
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: totalPrice,
          address
        })
      });

      if (!orderRes.ok) {
        alert('Could not create order');
        return;
      }

      const createdOrder = await orderRes.json();

      // 2. Ask backend to build the signed eSewa payment payload
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
        return;
      }

      // 3. Clear cart now (order already saved) and redirect browser to eSewa
      dispatch(clearCart());
      submitToEsewa(initData.paymentData);
    } catch (error) {
      console.error(error);
      alert('Something went wrong starting payment');
    }
  };

  // Builds a hidden form and submits it, redirecting the browser to eSewa's payment page
  const submitToEsewa = (paymentData) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://rc.esewa.com.np/api/epay/main/v2/form'; // eSewa test/sandbox URL

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
    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>
          <input type="text" placeholder="Full Name" required value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} />
          <input type="text" placeholder="Street" required value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
          <input type="text" placeholder="City" required value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
          <input type="text" placeholder="Postal Code" required value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} />
          <input type="text" placeholder="Country" required value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} />
          <div className="checkout-summary">
            <h4>MRP {totalPrice.toFixed(2)}</h4>
            <button type="submit" className="btn">Pay with eSewa</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;