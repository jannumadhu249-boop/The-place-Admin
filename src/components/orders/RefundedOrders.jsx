import React from 'react';
import OrderTable from './OrderTable';

export default function RefundedOrders({ orders, onUpdateStatus }) {
  const refunded = orders.filter(o => o.status === 'Refunded');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Refunded Orders</h1>
          <p>Orders returned or compensated to customer account or original payment instrument</p>
        </div>
      </div>
      <OrderTable 
        title="Refunded Transactions" 
        orders={refunded} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No refunded orders currently on file."
      />
    </div>
  );
}
