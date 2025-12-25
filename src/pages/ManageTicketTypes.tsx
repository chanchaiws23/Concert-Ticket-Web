import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getTicketTypes, createTicketType, updateTicketType, deleteTicketType, getEvents, type TicketTypeResponse } from '../api';
import { useToast } from '../hooks/useToast';
import Loading from '../components/Loading';

export default function ManageTicketTypes() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    eventId: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketTypeResponse | null>(null);
  const [form, setForm] = useState({
    eventId: 0,
    name: '',
    price: 0,
    totalQuantity: 0,
  });
  const [editForm, setEditForm] = useState({
    name: '',
    price: 0,
    totalQuantity: 0,
  });

  const loadTicketTypes = async () => {
    if (auth?.user?.role !== 'ADMIN' && auth?.user?.role !== 'ORGANIZER') {
      return;
    }
    
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      
      if (filters.eventId && filters.eventId > 0) {
        params.eventId = filters.eventId;
      }
      
      console.log('Loading ticket types with params:', params);
      const response = await getTicketTypes(params);
      console.log('Ticket types response:', response);
      
      setTicketTypes(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (error: any) {
      console.error('Error loading ticket types:', error);
      console.error('Error details:', error.response?.data);
      showToast(error.response?.data?.message || error.response?.data?.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      setTicketTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await getEvents();
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    }
  };

  // Load events on mount
  useEffect(() => {
    if (auth?.user?.role !== 'ADMIN' && auth?.user?.role !== 'ORGANIZER') {
      navigate('/');
      return;
    }
    loadEvents();
  }, [auth, navigate]);

  // Load ticket types when filters or page change
  useEffect(() => {
    if (auth?.user?.role === 'ADMIN' || auth?.user?.role === 'ORGANIZER') {
      loadTicketTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters.search, filters.eventId, auth?.user?.role]);

  const handleCreate = async () => {
    try {
      await createTicketType(form);
      showToast('สร้าง Ticket Type สำเร็จ', 'success');
      setShowCreateModal(false);
      setForm({ eventId: 0, name: '', price: 0, totalQuantity: 0 });
      loadTicketTypes();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้าง', 'error');
    }
  };

  const handleEdit = (ticketType: TicketTypeResponse) => {
    setEditingTicketType(ticketType);
    setEditForm({
      name: ticketType.name,
      price: ticketType.price,
      totalQuantity: ticketType.total_quantity,
    });
  };

  const handleUpdate = async () => {
    if (!editingTicketType) return;
    try {
      await updateTicketType(editingTicketType.id, editForm);
      showToast('อัปเดต Ticket Type สำเร็จ', 'success');
      setEditingTicketType(null);
      loadTicketTypes();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Ticket Type นี้?')) return;
    try {
      await deleteTicketType(id);
      showToast('ลบ Ticket Type สำเร็จ', 'success');
      loadTicketTypes();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  if (loading && ticketTypes.length === 0) {
    return <Loading fullScreen />;
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
                <span className="mr-3">🎟️</span>
                จัดการ Ticket Types
              </h1>
              <p className="text-gray-600">จัดการ Ticket Types ทั้งหมดในระบบ</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                + สร้าง Ticket Type
              </button>
              <button
                onClick={() => navigate(auth?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/organizer/dashboard')}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                ← กลับ
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
              <input
                type="text"
                placeholder="ค้นหาตาม ticket name หรือ event title..."
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
              <select
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                value={filters.eventId}
                onChange={(e) => {
                  const eventId = Number(e.target.value);
                  setFilters({ ...filters, eventId: eventId || 0 });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value={0}>ทั้งหมด</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ search: '', eventId: 0 });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Types Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ Ticket</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ราคา</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">จำนวนทั้งหมด</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ขายแล้ว</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">เหลือ</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ticketTypes.map((ticketType) => {
                  const remaining = ticketType.total_quantity - ticketType.sold_quantity;
                  return (
                    <tr key={ticketType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ticketType.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {ticketType.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ticketType.event_title || `Event #${ticketType.event_id}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ฿{ticketType.price.toLocaleString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ticketType.total_quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {ticketType.sold_quantity}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-semibold ${
                          remaining <= 10 ? 'text-red-600' :
                          remaining <= 50 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {remaining}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(ticketType)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(ticketType.id)}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                แสดง {((pagination.page - 1) * pagination.limit) + 1} ถึง {Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total} รายการ
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  ก่อนหน้า
                </button>
                <span className="px-4 py-2 text-gray-700">
                  หน้า {pagination.page} จาก {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">สร้าง Ticket Type ใหม่</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event</label>
                  <select
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={form.eventId}
                    onChange={(e) => setForm({ ...form, eventId: Number(e.target.value) })}
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
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="เช่น VIP, Standard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (฿)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนทั้งหมด</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={form.totalQuantity}
                    onChange={(e) => setForm({ ...form, totalQuantity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm({ eventId: 0, name: '', price: 0, totalQuantity: 0 });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  สร้าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingTicketType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">แก้ไข Ticket Type</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ Ticket</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (฿)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนทั้งหมด</label>
                  <input
                    type="number"
                    min={editingTicketType.sold_quantity}
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.totalQuantity}
                    onChange={(e) => setEditForm({ ...editForm, totalQuantity: Number(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    จำนวนทั้งหมดต้องมากกว่าหรือเท่ากับ {editingTicketType.sold_quantity} (จำนวนที่ขายแล้ว)
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setEditingTicketType(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

