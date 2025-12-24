import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const auth = useContext(AuthContext);
  const location = useLocation();
  const isOrganizer = auth?.user?.role === 'ORGANIZER' || auth?.user?.role === 'ADMIN';
  const isAdmin = auth?.user?.role === 'ADMIN';

  return (
    <nav className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 shadow-lg backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl">🎸</span>
            <span className="text-xl font-bold text-white group-hover:scale-105 transition-transform">ConcertTicket</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {auth?.user ? (
              <>
                <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                    {auth.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white text-sm">สวัสดี, {auth.user.name}</span>
                </div>
                
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      location.pathname === '/admin/dashboard'
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    👑 Admin
                  </Link>
                )}
                
                {isOrganizer && (
                  <Link 
                    to="/organizer/dashboard" 
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      location.pathname === '/organizer/dashboard'
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    🎤 จัดการงาน
                  </Link>
                )}
                
                {isOrganizer && (
                  <Link 
                    to="/create-event" 
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      location.pathname === '/create-event'
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    ✨ สร้างงาน
                  </Link>
                )}
                
                <Link 
                  to="/my-orders"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === '/my-orders'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  🎫 บัตรของฉัน
                </Link>
                <Link 
                  to="/profile"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === '/profile'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  👤 โปรไฟล์
                </Link>
                
                <button 
                  onClick={auth.logout} 
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    location.pathname === '/login'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}