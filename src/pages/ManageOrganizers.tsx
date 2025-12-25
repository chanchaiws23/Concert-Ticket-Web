import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getOrganizers, createOrganizer, updateOrganizer, deleteOrganizer, getUsers, type OrganizerResponse } from '../api';
import { useToast } from '../hooks/useToast';
import Loading from '../components/Loading';

export default function ManageOrganizers() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState<OrganizerResponse[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<OrganizerResponse | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    userId: 0,
    companyName: '',
  });
  const [editForm, setEditForm] = useState({
    companyName: '',
  });

  useEffect(() => {
    if (auth?.user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadOrganizers();
    loadUsers();
  }, [auth, navigate, pagination.page, search]);

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      const response = await getOrganizers({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
      });
      setOrganizers(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getUsers({ role: 'ORGANIZER' });
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadOrganizers();
  }, [pagination.page, search]);

  const handleCreate = async () => {
    try {
      await createOrganizer(form);
      showToast('สร้าง Organizer สำเร็จ', 'success');
      setShowCreateModal(false);
      setForm({ userId: 0, companyName: '' });
      loadOrganizers();
    } catch (error: any) {
      showToast(error.response?.data?.error || error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้าง', 'error');
    }
  };

  const handleEdit = (organizer: OrganizerResponse) => {
    setEditingOrganizer(organizer);
    setEditForm({ companyName: organizer.company_name });
  };

  const handleUpdate = async () => {
    if (!editingOrganizer) return;
    try {
      await updateOrganizer(editingOrganizer.id, editForm);
      showToast('อัปเดต Organizer สำเร็จ', 'success');
      setEditingOrganizer(null);
      loadOrganizers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Organizer นี้?')) return;
    try {
      await deleteOrganizer(id);
      showToast('ลบ Organizer สำเร็จ', 'success');
      loadOrganizers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  if (loading && organizers.length === 0) {
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
                <span className="mr-3">🏢</span>
                จัดการ Organizers
              </h1>
              <p className="text-gray-600">จัดการ Organizers ทั้งหมดในระบบ</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                + สร้าง Organizer
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                ← กลับ
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="ค้นหาตาม company name หรือ email..."
              className="flex-1 border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPagination({ ...pagination, page: 1 });
                }}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        {/* Organizers Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ชื่อบริษัท</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">วันที่สร้าง</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizers.map((organizer) => (
                  <tr key={organizer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{organizer.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {organizer.company_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{organizer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {organizer.first_name} {organizer.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(organizer.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(organizer)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(organizer.id)}
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
              <h2 className="text-2xl font-bold mb-4">สร้าง Organizer ใหม่</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User (ต้องเป็น ORGANIZER role)</label>
                  <select
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
                  >
                    <option value={0}>เลือก User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบริษัท</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="ชื่อบริษัท"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setForm({ userId: 0, companyName: '' });
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
        {editingOrganizer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">แก้ไข Organizer</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อบริษัท</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setEditingOrganizer(null)}
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

