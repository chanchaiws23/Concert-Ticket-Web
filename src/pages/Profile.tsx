import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import api from '../api/axios';
import Loading from '../components/Loading';

export default function Profile() {
  const auth = useContext(AuthContext);
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: auth?.user?.name || '',
    email: auth?.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (auth?.user) {
      setForm(prev => ({
        ...prev,
        name: auth.user!.name,
        email: auth.user!.email,
      }));
    }
  }, [auth]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/profile', {
        name: form.name,
        email: form.email,
      });
      showToast('อัปเดตโปรไฟล์สำเร็จ!', 'success');
      // Update local storage
      if (auth?.user) {
        const updatedUser = { ...auth.user, name: form.name, email: form.email };
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      showToast('รหัสผ่านไม่ตรงกัน', 'error');
      return;
    }

    if (form.newPassword.length < 6) {
      showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast('เปลี่ยนรหัสผ่านสำเร็จ!', 'success');
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      showToast(error.response?.data?.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!auth?.user) {
    return <Loading fullScreen message="กำลังโหลดข้อมูล..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      {ToastComponent}
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="mr-3">👤</span>
            โปรไฟล์ของฉัน
          </h1>
          <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Update Profile */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">ข้อมูลส่วนตัว</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ชื่อ</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">อีเมล</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">บทบาท</label>
                <div className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-50">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    auth.user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    auth.user.role === 'ORGANIZER' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {auth.user.role}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">เปลี่ยนรหัสผ่าน</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">รหัสผ่านปัจจุบัน</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  minLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

