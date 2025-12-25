import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUsers, deleteUser, updateUser, type UserResponse } from '../api';
import { useToast } from '../hooks/useToast';
import Loading from '../components/Loading';

export default function ManageUsers() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '' as 'USER' | 'ORGANIZER' | 'ADMIN' | '',
  });
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editForm, setEditForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'USER' as 'USER' | 'ORGANIZER' | 'ADMIN',
  });

  useEffect(() => {
    if (auth?.user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [auth, navigate, pagination.page, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        role: filters.role || undefined,
      });
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters]);

  const handleDelete = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้คนนี้?')) return;
    try {
      await deleteUser(id);
      showToast('ลบผู้ใช้สำเร็จ', 'success');
      loadUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editForm);
      showToast('อัปเดตผู้ใช้สำเร็จ', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต', 'error');
    }
  };

  if (loading && users.length === 0) {
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
                <span className="mr-3">👥</span>
                จัดการผู้ใช้
              </h1>
              <p className="text-gray-600">จัดการผู้ใช้ทั้งหมดในระบบ</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              ← กลับ
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
              <input
                type="text"
                placeholder="ค้นหาตาม email หรือ name..."
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                value={filters.role}
                onChange={(e) => {
                  setFilters({ ...filters, role: e.target.value as any });
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                <option value="">ทั้งหมด</option>
                <option value="USER">USER</option>
                <option value="ORGANIZER">ORGANIZER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilters({ search: '', role: '' });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">บริษัท</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">วันที่สร้าง</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'ORGANIZER' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.company_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          แก้ไข
                        </button>
                        {user.id !== auth?.user?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
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

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">แก้ไขผู้ใช้</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  >
                    <option value="USER">USER</option>
                    <option value="ORGANIZER">ORGANIZER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
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

