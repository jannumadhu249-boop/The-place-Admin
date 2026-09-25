import React from 'react';
import OrderTable from './OrderTable';

export default function PaymentFailedOrders({ orders, onUpdateStatus }) {
  const failed = orders.filter(o => o.status === 'Payment Failed');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Payment Failed Orders</h1>
          <p>Orders that experienced gateway declines, 3D secure timeouts, or insufficient funds</p>
        </div>
      </div>
      <OrderTable 
        title="Payment Failed Exceptions" 
        orders={failed} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No payment failure exceptions detected."
      />
    </div>
  );
}
