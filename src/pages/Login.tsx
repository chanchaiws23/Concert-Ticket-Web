import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (auth) {
        await auth.login(form.email, form.password);
        navigate('/');
      }
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-8 py-10 text-center">
            <div className="text-5xl mb-3">🎸</div>
            <h2 className="text-3xl font-bold text-white mb-2">เข้าสู่ระบบ</h2>
            <p className="text-purple-100">ยินดีต้อนรับกลับมา!</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center">
                <span className="mr-2">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                อีเมล
              </label>
              <input 
                type="email" 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="your@email.com"
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                รหัสผ่าน
              </label>
              <input 
                type="password" 
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                placeholder="••••••••"
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              เข้าสู่ระบบ
            </button>
            
            <p className="text-center text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline transition">
                สมัครสมาชิก
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}