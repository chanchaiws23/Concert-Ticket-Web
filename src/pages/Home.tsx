import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api';
import type { EventData } from '../types';

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
  }, []);

  // Filter Event ตามคำค้นหา
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-16 mb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              🎸 คอนเสิร์ตมาแรง 🔥
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              ค้นหาคอนเสิร์ตที่คุณรัก ไม่พลาดทุกความมันส์
            </p>
            <div className="relative max-w-xl mx-auto">
              <input 
                type="text" 
                placeholder="🔍 ค้นหาศิลปิน, สถานที่, หรือชื่อคอนเสิร์ต..." 
                className="w-full px-6 py-4 rounded-full text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 transition-all text-lg"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2"
            >
              <div className="relative overflow-hidden h-56">
                <img 
                  src={event.poster_url || 'https://via.placeholder.com/400x200'} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 min-h-[3rem]">
                  {event.title}
                </h2>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>{new Date(event.event_date).toLocaleDateString('th-TH', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
                <Link 
                  to={`/event/${event.id}`} 
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  ซื้อบัตรเลย →
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-xl text-gray-600 font-medium">ไม่พบงานที่คุณค้นหา...</p>
            <p className="text-gray-500 mt-2">ลองค้นหาด้วยคำอื่นหรือตรวจสอบการสะกดอีกครั้ง</p>
          </div>
        )}
      </div>
    </div>
  );
}