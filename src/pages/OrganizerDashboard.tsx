import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getEvents, getOrganizerEvents, getOrganizerOrders, getAdminOrders, deleteOrganizerEvent, deleteAdminEvent } from '../api';
import type { EventData, Order } from '../types';
import Swal from 'sweetalert2';

export default function OrganizerDashboard() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    if (auth?.user?.role !== 'ORGANIZER' && auth?.user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadData();
  }, [auth, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch events - ถ้าเป็น ADMIN ให้ดึงทั้งหมด, ถ้าเป็น ORGANIZER ให้ดึงของตัวเอง
      let eventsData: EventData[] = [];
      if (auth?.user?.role === 'ADMIN') {
        eventsData = await getEvents().catch(() => []);
      } else {
        const eventsRes = await getOrganizerEvents().catch(() => []);
        eventsData = eventsRes;
      }
      setEvents(eventsData);

      // Fetch orders - ถ้าเป็น ADMIN ให้ดึงทั้งหมด, ถ้าเป็น ORGANIZER ให้ดึงของตัวเอง
      let ordersData: Order[] = [];
      if (auth?.user?.role === 'ADMIN') {
        ordersData = await getAdminOrders().catch(() => []);
      } else {
        ordersData = await getOrganizerOrders().catch(() => []);
      }
      setOrders(ordersData);

      // Calculate stats - แยกการคำนวณสำหรับ ADMIN และ ORGANIZER
      const now = new Date();
      const upcomingEvents = eventsData.filter(e => new Date(e.event_date) > now).length;
      
      let totalTicketsSold = 0;
      let totalRevenue = 0;

      if (auth?.user?.role === 'ADMIN') {
        // สำหรับ ADMIN: คำนวณจาก events ทั้งหมดที่แสดง (รวม ticket_types)
        eventsData.forEach(event => {
          if (event.ticket_types) {
            event.ticket_types.forEach(ticketType => {
              totalTicketsSold += ticketType.sold_quantity;
              totalRevenue += ticketType.price * ticketType.sold_quantity;
            });
          }
        });
      } else {
        // สำหรับ ORGANIZER: คำนวณจาก orders ของตัวเอง
        ordersData.forEach(order => {
          const amount = typeof order.total_amount === 'string' 
            ? parseFloat(order.total_amount) 
            : Number(order.total_amount) || 0;
          totalRevenue += amount;
          order.items.forEach(item => {
            totalTicketsSold += item.qty;
          });
        });
      }

      setStats({
        totalEvents: eventsData.length,
        totalTicketsSold,
        totalRevenue,
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบงานคอนเสิร์ตนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl',
        cancelButton: 'rounded-xl',
      },
    });

    if (result.isConfirmed) {
      try {
        // ถ้าเป็น ADMIN ใช้ deleteAdminEvent, ถ้าเป็น ORGANIZER ใช้ deleteOrganizerEvent
        if (auth?.user?.role === 'ADMIN') {
          await deleteAdminEvent(id);
        } else {
          await deleteOrganizerEvent(id);
        }
        setEvents(events.filter(e => e.id !== id));
        await Swal.fire({
          title: 'ลบสำเร็จ!',
          text: 'งานคอนเสิร์ตถูกลบแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
        loadData();
      } catch (error: any) {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">🎤</span>
                {auth?.user?.role === 'ADMIN' ? 'Admin - Events Dashboard' : 'Organizer Dashboard'}
              </h1>
              <p className="text-gray-600">
                {auth?.user?.role === 'ADMIN' ? 'จัดการงานคอนเสิร์ตทั้งหมด' : 'จัดการงานคอนเสิร์ตของคุณ'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {auth?.user?.role === 'ORGANIZER' && (
                <Link
                  to="/create-event"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✨ สร้างงานใหม่
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">🎤</div>
            <div className="text-3xl font-bold mb-1">{stats.totalEvents}</div>
            <div className="text-purple-100">งานทั้งหมด</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold mb-1">{stats.upcomingEvents}</div>
            <div className="text-blue-100">งานที่กำลังจะมาถึง</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">🎫</div>
            <div className="text-3xl font-bold mb-1">{stats.totalTicketsSold}</div>
            <div className="text-green-100">บัตรที่ขายแล้ว</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-3xl font-bold mb-1">฿{Number(stats.totalRevenue || 0).toLocaleString('th-TH')}</div>
            <div className="text-yellow-100">รายได้รวม</div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {auth?.user?.role === 'ADMIN' ? 'งานคอนเสิร์ตทั้งหมด' : 'งานคอนเสิร์ตของคุณ'}
            </h2>
            <span className="text-gray-600">ทั้งหมด {events.length} งาน</span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มีงาน</h3>
              <p className="text-gray-600 mb-6">
                {auth?.user?.role === 'ADMIN' 
                  ? 'ยังไม่มีงานคอนเสิร์ตในระบบ' 
                  : 'เริ่มสร้างงานคอนเสิร์ตของคุณเลย!'}
              </p>
              {auth?.user?.role === 'ORGANIZER' && (
                <Link
                  to="/create-event"
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  สร้างงานใหม่
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const eventDate = new Date(event.event_date);
                const isUpcoming = eventDate > new Date();
                const totalTickets = event.ticket_types?.reduce((sum, t) => sum + t.total_quantity, 0) || 0;
                const soldTickets = event.ticket_types?.reduce((sum, t) => sum + t.sold_quantity, 0) || 0;
                const revenue = event.ticket_types?.reduce((sum, t) => sum + (t.price * t.sold_quantity), 0) || 0;

                return (
                  <div
                    key={event.id}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.poster_url || 'https://via.placeholder.com/400x200'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {!isUpcoming && (
                        <div className="absolute top-2 right-2 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          จบแล้ว
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">{event.title}</h3>
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">📅</span>
                          <span>{eventDate.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">บัตรขายแล้ว:</span>
                          <span className="font-bold">{soldTickets} / {totalTickets}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-600">รายได้:</span>
                          <span className="font-bold text-green-600">฿{revenue.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/event/${event.id}`}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-sm"
                        >
                          ดูรายละเอียด
                        </Link>
                        {auth?.user?.role === 'ORGANIZER' && (
                          <Link
                            to={`/event/${event.id}/edit`}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-center py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all text-sm"
                          >
                            แก้ไข
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all text-sm"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">คำสั่งซื้อล่าสุด</h2>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">Order {order.order_code || `#${order.id}`}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm text-gray-600">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name} x{item.qty}
                        </span>
                      ))}
                    </div>
                    <span className="font-bold text-lg text-purple-600">
                      ฿{Number(order.total_amount || 0).toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

