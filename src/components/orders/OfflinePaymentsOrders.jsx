import React from 'react';
import OrderTable from './OrderTable';

export default function OfflinePaymentsOrders({ orders, onUpdateStatus }) {
  const offline = orders.filter(o => o.status === 'Offline Payments' || o.paymentMethod.toLowerCase().includes('cash'));

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Offline Payments & Cash on Delivery</h1>
          <p>Orders requiring manual cash collection or offline terminal reconciliation by couriers</p>
        </div>
      </div>
      <OrderTable 
        title="Cash on Delivery & Offline Ledger" 
        orders={offline} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No offline or cash-on-delivery orders pending reconciliation."
      />
    </div>
  );
}
