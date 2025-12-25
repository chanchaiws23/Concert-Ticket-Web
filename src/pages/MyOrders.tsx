import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api';
import type { Order } from '../types';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getMyOrders().then(setOrders).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Wallet ของฉัน</h1>
          <p className="text-gray-600">บัตรคอนเสิร์ตทั้งหมดของคุณ</p>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ยังไม่มีบัตร</h2>
              <p className="text-gray-600 mb-6">ไปซื้อบัตรคอนเสิร์ตกันเลย!</p>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl shadow-xl p-6 relative overflow-hidden border-2 border-transparent hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Status Badge */}
                <div className={`absolute top-0 right-0 text-white text-xs px-4 py-2 rounded-bl-2xl font-bold shadow-lg ${
                  order.status === 'PAID' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                    : order.status === 'PENDING'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}>
                  {order.status === 'PAID' ? '✓ PAID' : order.status === 'PENDING' ? '⏳ PENDING' : order.status}
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-500 text-sm font-medium">Order {order.order_code || `#${order.id}`}</p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {new Date(order.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <span className="font-bold text-gray-800">{item.name}</span>
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            x{item.qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-200">
                      <span className="text-gray-600 font-medium">ยอดรวม:</span>
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ฿{Number(order.total_amount).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {order.status === 'PENDING' && (
                        <Link
                          to={`/payment/${order.id}`}
                          className="flex-1 text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
                        >
                          💳 ชำระเงิน
                        </Link>
                      )}
                      <Link
                        to={`/order/${order.id}`}
                        className={`${order.status === 'PENDING' ? 'flex-1' : 'w-full'} text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-sm`}
                      >
                        ดูรายละเอียด →
                      </Link>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center justify-center md:justify-end">
                    <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${order.order_code || `ORDER-${order.id}`}`} 
                        alt="QR Code" 
                        className="w-24 h-24 mix-blend-multiply mb-2"
                      />
                      <span className="text-xs text-gray-600 font-semibold block">Scan to Enter</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}