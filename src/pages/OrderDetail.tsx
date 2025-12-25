import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById } from '../api';
import type { Order } from '../types';
import Loading from '../components/Loading';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;
    try {
      const orderData = await getOrderById(parseInt(id));
      setOrder(orderData);
    } catch (error) {
      alert('ไม่พบคำสั่งซื้อ');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <button
            onClick={() => navigate('/my-orders')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center cursor-pointer"
          >
            ← กลับไปยังบัตรของฉัน
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">รายละเอียดคำสั่งซื้อ</h1>
          <p className="text-gray-600">Order {order.order_code || `#${order.id}`}</p>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
          <div className={`absolute top-0 right-0 text-white text-xs px-4 py-2 rounded-bl-2xl font-bold shadow-lg ${
            order.status === 'PAID' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : order.status === 'PENDING'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            {order.status === 'PAID' ? '✓ PAID' : order.status === 'PENDING' ? '⏳ PENDING' : order.status}
          </div>

          <div className="mb-6 pb-6 border-b-2 border-dashed border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">หมายเลขคำสั่งซื้อ</p>
                <p className="text-2xl font-bold text-gray-800">{order.order_code || `#${order.id}`}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-sm font-medium mb-1">วันที่สั่งซื้อ</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">รายการบัตร</h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                      <p className="text-sm text-gray-600 mt-1">จำนวน: {item.qty} ใบ</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                        x{item.qty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">ยอดรวมทั้งสิ้น</span>
              <span className="text-3xl font-bold">฿{Number(order.total_amount || 0).toLocaleString('th-TH')}</span>
            </div>
          </div>

          {/* Payment Button for PENDING orders */}
          {order.status === 'PENDING' && (
            <div className="mt-6">
              <Link
                to={`/payment/${order.id}`}
                className="block w-full text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                💳 ชำระเงิน
              </Link>
            </div>
          )}

          {/* QR Code - Only show for PAID orders */}
          {order.status === 'PAID' && (
            <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-200">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200 mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${order.order_code || `ORDER-${order.id}`}`}
                    alt="QR Code"
                    className="w-48 h-48 mix-blend-multiply"
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium">สแกน QR Code เพื่อเข้าชมคอนเสิร์ต</p>
                <p className="text-xs text-gray-500 mt-2">Order Code: {order.order_code || `#${order.id}`}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

