import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import type { EventData, User, Order } from '../types';

export default function AdminDashboard() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'orders' | 'stats'>('stats');
  const [events, setEvents] = useState<EventData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (auth?.user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadData();
  }, [auth, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, usersRes, ordersRes] = await Promise.all([
        api.get<EventData[]>('/events'),
        api.get<User[]>('/admin/users'),
        api.get<Order[]>('/admin/orders'),
      ]).catch(() => [
        { data: [] },
        { data: [] },
        { data: [] },
      ]);

      setEvents(eventsRes.data);
      setUsers(usersRes.data);
      setOrders(ordersRes.data);

      // Calculate stats - แปลง total_amount เป็น number ก่อนคำนวณ
      const totalRevenue = ordersRes.data.reduce((sum, order) => {
        const amount = typeof order.total_amount === 'string' 
          ? parseFloat(order.total_amount) 
          : Number(order.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      setStats({
        totalEvents: eventsRes.data.length,
        totalUsers: usersRes.data.length,
        totalOrders: ordersRes.data.length,
        totalRevenue: Number(totalRevenue) || 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบงานคอนเสิร์ตนี้?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      alert('ลบงานสำเร็จ');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้คนนี้?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      alert('ลบผู้ใช้สำเร็จ');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบ');
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
                <span className="mr-3">👑</span>
                Admin Dashboard
              </h1>
              <p className="text-gray-600">จัดการระบบทั้งหมด</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">ยินดีต้อนรับ</p>
              <p className="text-lg font-bold text-purple-600">{auth?.user?.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">🎤</div>
            <div className="text-3xl font-bold mb-1">{stats.totalEvents}</div>
            <div className="text-blue-100">งานคอนเสิร์ตทั้งหมด</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
            <div className="text-green-100">ผู้ใช้ทั้งหมด</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">🎫</div>
            <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
            <div className="text-yellow-100">คำสั่งซื้อทั้งหมด</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-3xl font-bold mb-1">฿{Number(stats.totalRevenue || 0).toLocaleString('th-TH')}</div>
            <div className="text-purple-100">รายได้รวม</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'stats', label: '📊 สถิติ', icon: '📊' },
                { id: 'events', label: '🎤 งานคอนเสิร์ต', icon: '🎤' },
                { id: 'users', label: '👥 ผู้ใช้', icon: '👥' },
                { id: 'orders', label: '🎫 คำสั่งซื้อ', icon: '🎫' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">📈 ภาพรวมระบบ</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">งานคอนเสิร์ต</span>
                        <span className="font-bold text-lg">{stats.totalEvents}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">ผู้ใช้ทั้งหมด</span>
                        <span className="font-bold text-lg">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">คำสั่งซื้อ</span>
                        <span className="font-bold text-lg">{stats.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-purple-200">
                        <span className="text-gray-800 font-semibold">รายได้รวม</span>
                        <span className="font-bold text-2xl text-purple-600">
                          ฿{Number(stats.totalRevenue || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">🎯 ระบบจัดการ</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>• จัดการงานคอนเสิร์ตทั้งหมด</p>
                      <p>• จัดการผู้ใช้ในระบบ</p>
                      <p>• ดูคำสั่งซื้อทั้งหมด</p>
                      <p>• ตรวจสอบสถิติระบบ</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">งานคอนเสิร์ตทั้งหมด</h2>
                  <span className="text-gray-600">ทั้งหมด {events.length} งาน</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่องาน</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานที่</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{event.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{event.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{event.venue}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(event.event_date).toLocaleDateString('th-TH')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => navigate(`/event/${event.id}`)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              ดู
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {events.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ไม่มีงานคอนเสิร์ต</div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">ผู้ใช้ทั้งหมด</h2>
                  <span className="text-gray-600">ทั้งหมด {users.length} คน</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{user.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                              user.role === 'ORGANIZER' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {user.id !== auth?.user?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ลบ
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ไม่มีผู้ใช้</div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">คำสั่งซื้อทั้งหมด</h2>
                  <span className="text-gray-600">ทั้งหมด {orders.length} คำสั่งซื้อ</span>
                </div>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString('th-TH')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-4 border-t-2 border-gray-300">
                        <span className="text-lg font-bold text-purple-600">
                          ฿{Number(order.total_amount || 0).toLocaleString('th-TH')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ไม่มีคำสั่งซื้อ</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

