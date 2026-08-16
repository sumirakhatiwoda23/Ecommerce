import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const VerifyEsewa = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const encodedData = params.get('data');

        if (!encodedData) {
          setStatus('No payment data received.');
          return;
        }

        // eSewa sends the result as a base64-encoded JSON string
        const decoded = JSON.parse(atob(encodedData));
        const { transaction_uuid, total_amount } = decoded;

        const verifyRes = await fetch(`${API_URL}/api/payment/esewa-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_uuid, total_amount })
        });

        const result = await verifyRes.json();

        if (result.success) {
          navigate('/ordersuccess');
        } else {
          setStatus('Payment verification failed: ' + result.message);
        }
      } catch (error) {
        console.error(error);
        setStatus('Something went wrong verifying your payment.');
      }
    };

    verify();
  }, [navigate]);

  return (
    <div className="verify-esewa-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2>{status}</h2>
    </div>
  );
};

export default VerifyEsewa;