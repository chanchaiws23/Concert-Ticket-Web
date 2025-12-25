import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api';
import { useToast } from '../hooks/useToast';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', venue: '', event_date: '', poster_url: ''
  });
  
  // State สำหรับจัดการบัตรหลายประเภท
  const [tickets, setTickets] = useState([{ name: '', price: 0, total_quantity: 0 }]);

  const addTicketSlot = () => {
    setTickets([...tickets, { name: '', price: 0, total_quantity: 0 }]);
  };

  const handleTicketChange = (index: number, field: string, value: any) => {
    const newTickets = [...tickets];
    (newTickets[index] as any)[field] = value;
    setTickets(newTickets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // แปลง event_date เป็น ISO format
      const eventDate = new Date(form.event_date).toISOString();
      
      await createEvent({
        title: form.title,
        description: form.description,
        venue: form.venue,
        eventDate: eventDate,
        posterUrl: form.poster_url,
        ticketTypes: tickets.map(t => ({
          name: t.name,
          price: t.price,
          total_quantity: t.total_quantity,
        })),
      });
      showToast('สร้างงานสำเร็จ! 🎉', 'success');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      {ToastComponent}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-8 py-8 text-center">
            <div className="text-5xl mb-3">🎤</div>
            <h1 className="text-3xl font-bold text-white">สร้างงานคอนเสิร์ตใหม่</h1>
            <p className="text-purple-100 mt-2">สร้างงานที่น่าตื่นเต้นและขายบัตรได้เลย!</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">ชื่อคอนเสิร์ต *</label>
              <input 
                placeholder="เช่น Coldplay Live in Bangkok" 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">รายละเอียดงาน *</label>
              <textarea 
                placeholder="อธิบายรายละเอียดของงานคอนเสิร์ต..." 
                className="w-full border-2 border-gray-200 p-3 rounded-xl h-32 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                onChange={e => setForm({...form, description: e.target.value})} 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">สถานที่จัดงาน *</label>
                <input 
                  placeholder="เช่น IMPACT Arena" 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={e => setForm({...form, venue: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">วันที่และเวลา *</label>
                <input 
                  type="datetime-local" 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  onChange={e => setForm({...form, event_date: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">URL รูปโปสเตอร์ *</label>
              <input 
                placeholder="https://example.com/poster.jpg" 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                onChange={e => setForm({...form, poster_url: e.target.value})} 
                required 
              />
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200">
              <h3 className="font-bold text-xl mb-4 flex items-center">
                <span className="mr-2">🎫</span>
                ประเภทบัตรที่เปิดขาย
              </h3>
              
              <div className="space-y-3 mb-4">
                {tickets.map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <input 
                      placeholder="ชื่อบัตร (เช่น VIP)" 
                      className="border-2 border-gray-200 p-2 rounded-lg flex-1 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      onChange={e => handleTicketChange(index, 'name', e.target.value)} 
                      required 
                    />
                    <input 
                      type="number" 
                      placeholder="ราคา" 
                      min="0"
                      className="border-2 border-gray-200 p-2 rounded-lg w-28 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      onChange={e => handleTicketChange(index, 'price', Number(e.target.value))} 
                      required 
                    />
                    <input 
                      type="number" 
                      placeholder="จำนวน" 
                      min="1"
                      className="border-2 border-gray-200 p-2 rounded-lg w-28 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      onChange={e => handleTicketChange(index, 'total_quantity', Number(e.target.value))} 
                      required 
                    />
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                onClick={addTicketSlot} 
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition flex items-center"
              >
                + เพิ่มประเภทบัตร
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังสร้าง...' : '✨ ยืนยันการสร้างงาน'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}