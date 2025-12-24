import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import type { EventData } from '../types';
import { useToast } from '../hooks/useToast';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { showToast, ToastComponent } = useToast();
  const [event, setEvent] = useState<EventData | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<EventData>(`/events/${id}`).then((res) => setEvent(res.data)).catch(() => {
      showToast('ไม่พบงานที่คุณต้องการ', 'error');
      navigate('/');
    });
  }, [id, navigate, showToast]);

  const handleBuy = async () => {
    if (!auth?.user) {
      showToast('กรุณาเข้าสู่ระบบก่อนซื้อบัตร', 'warning');
      navigate('/login');
      return;
    }

    const selectedTicket = event?.ticket_types?.find(t => t.id === parseInt(selectedTicketId));
    if (selectedTicket) {
      const remaining = selectedTicket.total_quantity - selectedTicket.sold_quantity;
      if (quantity > remaining) {
        showToast(`จำนวนบัตรไม่เพียงพอ (เหลือ ${remaining} ใบ)`, 'error');
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('/orders/purchase', {
        items: [{ ticketTypeId: parseInt(selectedTicketId), quantity }]
      });
      showToast('ซื้อบัตรสำเร็จ! เตรียมตัวไปมันส์ได้เลย 🎉', 'success');
      setTimeout(() => {
        navigate('/my-orders');
      }, 1500);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'เกิดข้อผิดพลาดในการซื้อบัตร', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const isOrganizer = auth?.user?.role === 'ORGANIZER' || auth?.user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      {ToastComponent}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Hero Image Section */}
          <div className="relative h-64 md:h-96 overflow-hidden">
            <img 
              src={event.poster_url || 'https://via.placeholder.com/800x400'} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-lg">
                <span className="flex items-center">
                  📅 {new Date(event.event_date).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center">
                  📍 {event.venue}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 p-8">
            {/* Description */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">เกี่ยวกับคอนเสิร์ต</h2>
                {isOrganizer && (
                  <Link
                    to={`/event/${event.id}/edit`}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all text-sm"
                  >
                    ✏️ แก้ไขงาน
                  </Link>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Ticket Selection */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="mr-2">🎫</span>
                เลือกประเภทบัตร
              </h3>
              
              <select 
                className="w-full border-2 border-gray-300 p-3 rounded-xl mb-4 bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium"
                onChange={(e) => setSelectedTicketId(e.target.value)}
                value={selectedTicketId}
              >
                <option value="">-- กรุณาเลือกบัตร --</option>
                {event.ticket_types?.map((ticket) => {
                  const remaining = ticket.total_quantity - ticket.sold_quantity;
                  return (
                    <option key={ticket.id} value={ticket.id} disabled={remaining <= 0}>
                      {ticket.name} - {ticket.price.toLocaleString()} บาท {remaining <= 0 ? '(หมดแล้ว)' : `(เหลือ ${remaining})`}
                    </option>
                  );
                })}
              </select>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">จำนวน:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border-2 border-gray-300 p-3 rounded-xl text-center text-lg font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>

              <button 
                onClick={handleBuy}
                disabled={!selectedTicketId || loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังดำเนินการ...' : '🎉 ยืนยันการจอง'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}