import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    };
    fetchOrders();
  }, [user]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(orders.map(order => order._id === id ? { ...order, status } : order));
      } else {
        alert('Could not update order status');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong updating the order');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Manage Orders</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={rowStyle}>
              <th style={thStyle}>ORDER ID</th>
              <th style={thStyle}>ITEMS</th>
              <th style={thStyle}>USER</th>
              <th style={thStyle}>TOTAL</th>
              <th style={thStyle}>PAYMENT</th>
              <th style={thStyle}>DATE</th>
              <th style={thStyle}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const isUpdating = updatingId === order._id;
              return (
                <tr key={order._id} style={rowStyle}>
                  <td style={tdStyle}>{order._id.substring(0, 8)}...</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '160px' }}>
                      {order.items.map((item, idx) => (
                        <img
                          key={idx}
                          src={item.imageUrl || '/placeholder.png'}
                          alt={item.name || 'Product'}
                          title={`${item.name || 'Product'} × ${item.qty}`}
                          style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #27272a' }}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={tdStyle}>{order.userId?.name || 'Deleted User'}</td>
                  <td style={tdStyle}>MRP {order.totalAmount.toFixed(2)}</td>
                  <td style={tdStyle}>
                    {order.paymentId ? (
                      <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Paid</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Unpaid</span>
                    )}
                  </td>
                  <td style={tdStyle}>{new Date(order.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>
                    {isUpdating ? (
                      <span style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Updating...</span>
                    ) : (
                      <>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', cursor: order.status === 'Delivered' ? 'default' : 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={order.status === 'Shipped' || order.status === 'Delivered'}
                            disabled={order.status === 'Delivered'}
                            onChange={(e) => e.target.checked && updateStatus(order._id, 'Shipped')}
                          />
                          Shipped
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={order.status === 'Delivered'}
                            onChange={(e) => e.target.checked && updateStatus(order._id, 'Delivered')}
                          />
                          Delivered
                        </label>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const containerStyle = { maxWidth: '1200px', margin: '40px auto', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', color: '#fafafa' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const rowStyle = { borderBottom: '1px solid rgba(255,255,255,0.1)' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#a1a1aa', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', textAlign: 'left' };

export default AdminOrders;