import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  getEvents, deleteAdminEvent, getAdminOrders, getAdminUsers, deleteUser, updateUser,
  getOrganizers, createOrganizer, updateOrganizer, deleteOrganizer,
  getTicketTypes, createTicketType, updateTicketType, deleteTicketType,
  type OrganizerResponse, type TicketTypeResponse
} from '../api';
import type { EventData, User, Order } from '../types';
import { useToast } from '../hooks/useToast';
import Swal from 'sweetalert2';

export default function AdminDashboard() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'users' | 'orders' | 'organizers' | 'ticketTypes'>('stats');
  const [events, setEvents] = useState<EventData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ email: '', firstName: '', lastName: '', role: 'USER' as 'USER' | 'ORGANIZER' | 'ADMIN' });

  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<OrganizerResponse | null>(null);
  const [organizerForm, setOrganizerForm] = useState({ userId: 0, companyName: '' });
  const [organizerUsers, setOrganizerUsers] = useState<User[]>([]);

  const [showTicketTypeModal, setShowTicketTypeModal] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketTypeResponse | null>(null);
  const [ticketTypeForm, setTicketTypeForm] = useState({ eventId: 0, name: '', price: 0, totalQuantity: 0 });

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
      const [eventsData, usersData, ordersData, organizersData, ticketTypesData] = await Promise.all([
        getEvents().catch(() => []),
        getAdminUsers().catch(() => []),
        getAdminOrders().catch(() => []),
        getOrganizers().catch(() => ({ data: [] })),
        getTicketTypes().catch(() => ({ data: [] })),
      ]);

      setEvents(eventsData);
      setUsers(usersData);
      setOrders(ordersData);
      setOrganizers(organizersData.data || []);
      setTicketTypes(ticketTypesData.data || []);

      // Load organizer users
      const orgUsers = usersData.filter(u => u.role === 'ORGANIZER');
      setOrganizerUsers(orgUsers);

      // Calculate stats - คำนวณรายได้จาก events (ticket_types) เพื่อให้ตรงกับ OrganizerDashboard
      let totalRevenue = 0;
      eventsData.forEach(event => {
        if (event.ticket_types) {
          event.ticket_types.forEach(ticketType => {
            totalRevenue += ticketType.price * ticketType.sold_quantity;
          });
        }
      });
      
      setStats({
        totalEvents: eventsData.length,
        totalUsers: usersData.length,
        totalOrders: ordersData.length,
        totalRevenue: Number(totalRevenue) || 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
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
        await deleteAdminEvent(id);
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    // Parse name to firstName and lastName
    const nameParts = user.name.split(' ');
    setUserForm({
      email: user.email,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      role: user.role,
    });
    setShowUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, userForm);
      await Swal.fire({
        title: 'อัปเดตสำเร็จ!',
        text: 'ข้อมูลผู้ใช้ถูกอัปเดตแล้ว',
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
      setShowUserModal(false);
      setEditingUser(null);
      loadData();
    } catch (error: any) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
    }
  };

  const handleDeleteUser = async (id: number) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบผู้ใช้คนนี้หรือไม่?',
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
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        await Swal.fire({
          title: 'ลบสำเร็จ!',
          text: 'ผู้ใช้ถูกลบแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
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

  // Organizer handlers
  const handleCreateOrganizer = async () => {
    try {
      await createOrganizer(organizerForm);
      await Swal.fire({
        title: 'สร้างสำเร็จ!',
        text: 'Organizer ถูกสร้างแล้ว',
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
      setShowOrganizerModal(false);
      setOrganizerForm({ userId: 0, companyName: '' });
      loadData();
    } catch (error: any) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.error || error.response?.data?.message || 'เกิดข้อผิดพลาด',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
    }
  };

  const handleEditOrganizer = (organizer: OrganizerResponse) => {
    setEditingOrganizer(organizer);
    setOrganizerForm({ userId: organizer.user_id, companyName: organizer.company_name });
    setShowOrganizerModal(true);
  };

  const handleUpdateOrganizer = async () => {
    if (!editingOrganizer) return;
    try {
      await updateOrganizer(editingOrganizer.id, { companyName: organizerForm.companyName });
      await Swal.fire({
        title: 'อัปเดตสำเร็จ!',
        text: 'ข้อมูล Organizer ถูกอัปเดตแล้ว',
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
      setShowOrganizerModal(false);
      setEditingOrganizer(null);
      loadData();
    } catch (error: any) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาด',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
    }
  };

  const handleDeleteOrganizer = async (id: number) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบ Organizer นี้หรือไม่?',
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
        await deleteOrganizer(id);
        setOrganizers(organizers.filter(o => o.id !== id));
        await Swal.fire({
          title: 'ลบสำเร็จ!',
          text: 'Organizer ถูกลบแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
      } catch (error: any) {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.response?.data?.message || 'เกิดข้อผิดพลาด',
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

  // Ticket Type handlers
  const handleCreateTicketType = async () => {
    try {
      await createTicketType(ticketTypeForm);
      await Swal.fire({
        title: 'สร้างสำเร็จ!',
        text: 'Ticket Type ถูกสร้างแล้ว',
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
      setShowTicketTypeModal(false);
      setTicketTypeForm({ eventId: 0, name: '', price: 0, totalQuantity: 0 });
      loadData();
    } catch (error: any) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.message || 'เกิดข้อผิดพลาด',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
    }
  };

  const handleEditTicketType = (ticketType: TicketTypeResponse) => {
    setEditingTicketType(ticketType);
    setTicketTypeForm({
      eventId: ticketType.event_id,
      name: ticketType.name,
      price: ticketType.price,
      totalQuantity: ticketType.total_quantity,
    });
    setShowTicketTypeModal(true);
  };

  const handleUpdateTicketType = async () => {
    if (!editingTicketType) return;
    try {
      await updateTicketType(editingTicketType.id, {
        name: ticketTypeForm.name,
        price: ticketTypeForm.price,
        totalQuantity: ticketTypeForm.totalQuantity,
      });
      await Swal.fire({
        title: 'อัปเดตสำเร็จ!',
        text: 'ข้อมูล Ticket Type ถูกอัปเดตแล้ว',
        icon: 'success',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
      setShowTicketTypeModal(false);
      setEditingTicketType(null);
      loadData();
    } catch (error: any) {
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.error || error.response?.data?.message || 'เกิดข้อผิดพลาด',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl',
        },
      });
    }
  };

  const handleDeleteTicketType = async (id: number) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบ Ticket Type นี้หรือไม่?',
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
        await deleteTicketType(id);
        setTicketTypes(ticketTypes.filter(t => t.id !== id));
        await Swal.fire({
          title: 'ลบสำเร็จ!',
          text: 'Ticket Type ถูกลบแล้ว',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
          },
        });
      } catch (error: any) {
        await Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.response?.data?.error || error.response?.data?.message || 'เกิดข้อผิดพลาด',
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
      {ToastComponent}
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
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'stats', label: '📊 สถิติ', icon: '📊' },
                { id: 'events', label: '🎤 งานคอนเสิร์ต', icon: '🎤' },
                { id: 'users', label: '👥 ผู้ใช้', icon: '👥' },
                { id: 'orders', label: '🎫 คำสั่งซื้อ', icon: '🎫' },
                { id: 'organizers', label: '🏢 Organizers', icon: '🏢' },
                { id: 'ticketTypes', label: '🎟️ Ticket Types', icon: '🎟️' },
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-800 font-semibold"
                              >
                                แก้ไข
                              </button>
                              {user.id !== auth?.user?.id && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-800 font-semibold"
                                >
                                  ลบ
                                </button>
                              )}
                            </div>
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
                    <div key={order.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order {order.order_code || `#${order.id}`}</p>
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

            {/* Organizers Tab */}
            {activeTab === 'organizers' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">จัดการ Organizers</h2>
                  <button
                    onClick={() => {
                      setEditingOrganizer(null);
                      setOrganizerForm({ userId: 0, companyName: '' });
                      setShowOrganizerModal(true);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                  >
                    + สร้าง Organizer
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อบริษัท</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {organizers.map((organizer) => (
                        <tr key={organizer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{organizer.id}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {organizer.company_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{organizer.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {organizer.first_name} {organizer.last_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditOrganizer(organizer)}
                                className="text-blue-600 hover:text-blue-800 font-semibold"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => handleDeleteOrganizer(organizer.id)}
                                className="text-red-600 hover:text-red-800 font-semibold"
                              >
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {organizers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ไม่มี Organizers</div>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Types Tab */}
            {activeTab === 'ticketTypes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">จัดการ Ticket Types</h2>
                  <button
                    onClick={() => {
                      setEditingTicketType(null);
                      setTicketTypeForm({ eventId: 0, name: '', price: 0, totalQuantity: 0 });
                      setShowTicketTypeModal(true);
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                  >
                    + สร้าง Ticket Type
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ Ticket</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ราคา</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวนทั้งหมด</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ขายแล้ว</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">เหลือ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticketTypes.map((ticketType) => {
                        const remaining = ticketType.total_quantity - ticketType.sold_quantity;
                        return (
                          <tr key={ticketType.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{ticketType.id}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {ticketType.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {ticketType.event_title || `Event #${ticketType.event_id}`}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ฿{ticketType.price.toLocaleString('th-TH')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {ticketType.total_quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {ticketType.sold_quantity}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`font-semibold ${
                                remaining <= 10 ? 'text-red-600' :
                                remaining <= 50 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {remaining}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditTicketType(ticketType)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  onClick={() => handleDeleteTicketType(ticketType.id)}
                                  className="text-red-600 hover:text-red-800 font-semibold"
                                  disabled={ticketType.sold_quantity > 0}
                                  title={ticketType.sold_quantity > 0 ? 'ไม่สามารถลบได้เพราะมีบัตรที่ขายแล้ว' : ''}
                                >
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {ticketTypes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ไม่มี Ticket Types</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{editingUser ? 'แก้ไขผู้ใช้' : 'สร้างผู้ใช้'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                >
                  <option value="USER">USER</option>
                  <option value="ORGANIZER">ORGANIZER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organizer Modal */}
      {showOrganizerModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{editingOrganizer ? 'แก้ไข Organizer' : 'สร้าง Organizer'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User (ต้องเป็น ORGANIZER role)</label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={organizerForm.userId}
                  onChange={(e) => setOrganizerForm({ ...organizerForm, userId: Number(e.target.value) })}
                  disabled={!!editingOrganizer}
                >
                  <option value={0}>เลือก User</option>
                  {organizerUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบริษัท</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={organizerForm.companyName}
                  onChange={(e) => setOrganizerForm({ ...organizerForm, companyName: e.target.value })}
                  placeholder="ชื่อบริษัท"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowOrganizerModal(false);
                  setEditingOrganizer(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={editingOrganizer ? handleUpdateOrganizer : handleCreateOrganizer}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                {editingOrganizer ? 'บันทึก' : 'สร้าง'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Type Modal */}
      {showTicketTypeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{editingTicketType ? 'แก้ไข Ticket Type' : 'สร้าง Ticket Type'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={ticketTypeForm.eventId}
                  onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, eventId: Number(e.target.value) })}
                  disabled={!!editingTicketType}
                >
                  <option value={0}>เลือก Event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ Ticket</label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={ticketTypeForm.name}
                  onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, name: e.target.value })}
                  placeholder="เช่น VIP, Standard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (฿)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={ticketTypeForm.price}
                  onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนทั้งหมด</label>
                <input
                  type="number"
                  min={editingTicketType ? editingTicketType.sold_quantity : 1}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                  value={ticketTypeForm.totalQuantity}
                  onChange={(e) => setTicketTypeForm({ ...ticketTypeForm, totalQuantity: Number(e.target.value) })}
                />
                {editingTicketType && (
                  <p className="text-xs text-gray-500 mt-1">
                    จำนวนทั้งหมดต้องมากกว่าหรือเท่ากับ {editingTicketType.sold_quantity} (จำนวนที่ขายแล้ว)
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowTicketTypeModal(false);
                  setEditingTicketType(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={editingTicketType ? handleUpdateTicketType : handleCreateTicketType}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                {editingTicketType ? 'บันทึก' : 'สร้าง'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

