import { generateEsewaSignature } from '../utils/esewaSignature.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Order from '../models/Order.js';

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;

const initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const transactionUuid = `${orderId}-${uuidv4()}`;

    const paymentData = {
      amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: `${process.env.FRONTEND_URL}/verify-esewa`,
      failure_url: `${process.env.FRONTEND_URL}/orders`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };

    paymentData.signature = generateEsewaSignature(
      paymentData.total_amount,
      transactionUuid,
      ESEWA_PRODUCT_CODE,
      ESEWA_SECRET_KEY
    );

    res.json({ success: true, paymentData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEsewaPayment = async (req, res) => {
  try {
    const { transaction_uuid, total_amount } = req.body;

    const response = await axios.get(
      `https://rc.esewa.com.np/api/epay/transaction/status/`,
      {
        params: {
          product_code: ESEWA_PRODUCT_CODE,
          total_amount,
          transaction_uuid,
        },
      }
    );

    console.log('eSewa status response:', response.data);

    if (response.data.status === 'COMPLETE') {
      // transaction_uuid was built as `${orderId}-${uuidv4()}`
      // MongoDB ObjectIds (24 hex chars) don't contain dashes, so the part before the first '-' is the orderId
      const orderId = transaction_uuid.split('-')[0];

      await Order.findByIdAndUpdate(orderId, { paymentId: transaction_uuid, status: 'Pending' });

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { initiateEsewaPayment, verifyEsewaPayment };