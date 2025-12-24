import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-purple-600 mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="text-xl text-gray-600 mb-8">ขออภัย หน้าที่คุณกำลังมองหาอาจถูกลบ ย้าย หรือไม่มีอยู่</p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            กลับหน้าหลัก
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            กลับหน้าก่อนหน้า
          </button>
        </div>
      </div>
    </div>
  );
}

