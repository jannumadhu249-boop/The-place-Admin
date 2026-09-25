import React from 'react';
import OrderTable from './OrderTable';

export default function CanceledOrders({ orders, onUpdateStatus }) {
  const canceled = orders.filter(o => o.status === 'Canceled');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Canceled Orders</h1>
          <p>Orders revoked by customer request, merchant rejection, or operational timeout</p>
        </div>
      </div>
      <OrderTable 
        title="Canceled Orders Log" 
        orders={canceled} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No canceled orders recorded."
      />
    </div>
  );
}
