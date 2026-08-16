import Order from '../models/Order.js';
import sendEmail from '../utils/sendEmail.js';

const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const buildItemsHtml = (items) => `
  <table style="width:100%; border-collapse: collapse; margin: 15px 0;">
    ${items.map(item => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">
          <img src="${item.imageUrl || ''}" alt="${item.name || 'Product'}" width="50" height="50" style="object-fit:cover; border-radius:4px;" />
        </td>
        <td style="padding:8px; border-bottom:1px solid #eee;">${item.name || 'Product'}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">Qty: ${item.qty}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">₹${item.price.toFixed(2)}</td>
      </tr>
    `).join('')}
  </table>
`;

const addOrderItems = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;
    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    } else {
      const order = new Order({
        userId: req.user._id, items, totalAmount, address, paymentId
      });
      const createdOrder = await order.save();

      const customerMessage = `
        <h2>Order Confirmation</h2>
        <p>Hello ${req.user.name},</p>
        <p>Your order has been successfully placed! Order ID: <strong>${createdOrder._id}</strong></p>
        <p>Placed on: <strong>${formatDateTime(createdOrder.createdAt)}</strong></p>
        ${buildItemsHtml(createdOrder.items)}
        <p>MRP: ${totalAmount.toFixed(2)}</p>
        <p>It will be shipped to: ${address.street}, ${address.city}</p>
        <p>Thank you for shopping with ShopNest!</p>
      `;

      await sendEmail({ email: req.user.email, subject: 'ShopNest - Order Confirmation', message: customerMessage });

      if (process.env.ADMIN_EMAIL) {
        const adminMessage = `
          <h2>New Order Received</h2>
          <p>Order ID: <strong>${createdOrder._id}</strong></p>
          <p>Placed on: <strong>${formatDateTime(createdOrder.createdAt)}</strong></p>
          <p>Customer: ${req.user.name} (${req.user.email})</p>
          ${buildItemsHtml(createdOrder.items)}
          <p>MRP: ${totalAmount.toFixed(2)}</p>
          <p>Shipping to: ${address.street}, ${address.city}, ${address.country}</p>
          <p>Log into the admin dashboard to view full details.</p>
        `;
        await sendEmail({ email: process.env.ADMIN_EMAIL, subject: `ShopNest - New Order (${createdOrder._id})`, message: adminMessage });
      }

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'id name')
      .sort({ createdAt: -1 }); // most recently placed order shows first
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (order) {
      const previousStatus = order.status;
      const newStatus = req.body.status || order.status;
      order.status = newStatus;
      const updatedOrder = await order.save();

      if (newStatus === 'Shipped' && previousStatus !== 'Shipped' && order.userId?.email) {
        const shippedMessage = `
          <h2>Your Order Has Been Shipped!</h2>
          <p>Hello ${order.userId.name},</p>
          <p>Good news — your order <strong>${order._id}</strong> has been shipped and is on its way.</p>
          <p>Shipped on: <strong>${formatDateTime(updatedOrder.updatedAt)}</strong></p>
          ${buildItemsHtml(order.items)}
          <p>It will be delivered to: ${order.address.street}, ${order.address.city}</p>
          <p>Thank you for shopping with ShopNest!</p>
        `;
        await sendEmail({
          email: order.userId.email,
          subject: 'ShopNest - Your Order Has Shipped',
          message: shippedMessage
        });
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addOrderItems, getMyOrders, getOrders, updateOrderStatus };