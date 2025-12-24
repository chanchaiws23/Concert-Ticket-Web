import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'USER', // Default เป็นคนซื้อ
    companyName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'การสมัครล้มเหลว');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-8 py-10 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">สมัครสมาชิกใหม่</h2>
            <p className="text-green-100">เริ่มต้นการผจญภัยของคุณวันนี้!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">ชื่อจริง</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="ชื่อ"
                  onChange={e => setForm({...form, firstName: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">นามสกุล</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="นามสกุล"
                  onChange={e => setForm({...form, lastName: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">อีเมล</label>
              <input 
                type="email" 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="your@email.com"
                onChange={e => setForm({...form, email: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">รหัสผ่าน</label>
              <input 
                type="password" 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                placeholder="••••••••"
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">ประเภทบัญชี</label>
              <select 
                className="w-full border-2 border-gray-200 p-3 rounded-xl bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
              >
                <option value="USER">👤 ผู้ซื้อบัตร (User)</option>
                <option value="ORGANIZER">🎤 ผู้จัดงาน (Organizer)</option>
              </select>
            </div>

            {form.role === 'ORGANIZER' && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 animate-fade-in">
                <label className="block text-gray-700 text-sm font-semibold mb-2">ชื่อบริษัทผู้จัด</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-amber-300 p-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="ชื่อบริษัท"
                  onChange={e => setForm({...form, companyName: e.target.value})} 
                  required 
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              สมัครสมาชิก
            </button>

            <p className="text-center text-sm text-gray-600">
              มีบัญชีแล้ว?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:text-green-700 hover:underline transition">
                เข้าสู่ระบบ
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}