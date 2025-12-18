
import React, { useState, useEffect } from 'react';
import { AppView, Flight, User, CheckInStep, IDCardData, LuggageAnalysis, FaceAnalysisResult, ConfirmationState, Hotel, HotelBookingStep } from './types';
import { CameraCapture } from './components/CameraCapture';
import { verifyFace, analyzeIDCard, analyzeLuggage, trainFaceModel, verifyIdentity } from './services/geminiService';
import { Plane, Search, Menu, UserCircle, MapPin, Briefcase, CheckCircle, AlertTriangle, ArrowRight, X, ScanFace, Database, Calendar, Clock, ArrowLeft, Mail, Lock, ShieldCheck, Star, Umbrella, Camera, RefreshCw, Bed, Key, Building, Wifi, Coffee } from 'lucide-react';

const FEATURED_LOCATIONS = [
  { 
    id: 1, 
    name: 'Đà Nẵng', 
    image: 'https://picsum.photos/800/600?random=1', 
    desc: 'Thành phố đáng sống với bãi biển Mỹ Khê và Cầu Rồng.',
    longDesc: 'Đà Nẵng được mệnh danh là thành phố đáng sống nhất Việt Nam. Nơi đây sở hữu bãi biển Mỹ Khê quyến rũ, bán đảo Sơn Trà hoang sơ và danh thắng Ngũ Hành Sơn hùng vĩ. Đặc biệt, Cầu Rồng phun lửa và nước vào cuối tuần là trải nghiệm không thể bỏ qua.',
    highlights: ['Cầu Rồng', 'Bãi biển Mỹ Khê', 'Bà Nà Hills', 'Ngũ Hành Sơn'],
    priceFrom: 1200000
  },
  { 
    id: 2, 
    name: 'Hà Nội', 
    image: 'https://picsum.photos/800/600?random=2', 
    desc: 'Thủ đô ngàn năm văn hiến, phở ngon và phố cổ.',
    longDesc: 'Hà Nội, thủ đô ngàn năm văn hiến, mang trong mình vẻ đẹp cổ kính và trầm mặc. Dạo quanh Hồ Gươm, thăm Lăng Bác hay thưởng thức một bát phở nóng hổi trong lòng Phố Cổ là những trải nghiệm mang đậm bản sắc văn hóa Việt Nam.',
    highlights: ['Hồ Gươm', 'Lăng Chủ tịch', 'Phố Cổ', 'Văn Miếu Quốc Tử Giám'],
    priceFrom: 1500000
  },
  { 
    id: 3, 
    name: 'Phú Quốc', 
    image: 'https://picsum.photos/800/600?random=3', 
    desc: 'Đảo Ngọc với những bãi biển xanh ngát và hải sản tươi sống.',
    longDesc: 'Phú Quốc - Đảo Ngọc thiên đường với những bãi biển nước xanh trong vắt như Bãi Sao, Bãi Khem. Tại đây, bạn có thể lặn ngắm san hô, tham quan VinWonders, Safari hoặc thưởng thức hải sản tươi sống tại làng chài Hàm Ninh.',
    highlights: ['Bãi Sao', 'VinWonders', 'Làng chài Hàm Ninh', 'Grand World'],
    priceFrom: 1800000
  },
];

const MOCK_FLIGHTS: Flight[] = [
  { id: 'FL001', airline: 'Vietnam Airlines', flightNumber: 'VN123', origin: 'Hồ Chí Minh', destination: 'Hà Nội', departureTime: '08:00', arrivalTime: '10:00', price: 1500000 },
  { id: 'FL002', airline: 'VietJet Air', flightNumber: 'VJ456', origin: 'Hồ Chí Minh', destination: 'Hà Nội', departureTime: '09:30', arrivalTime: '11:30', price: 900000 },
  { id: 'FL003', airline: 'Bamboo Airways', flightNumber: 'QH789', origin: 'Hồ Chí Minh', destination: 'Hà Nội', departureTime: '14:00', arrivalTime: '16:00', price: 1200000 },
];

const MOCK_HOTELS: Hotel[] = [
  { id: 101, name: "Vinpearl Resort & Spa", location: "Đà Nẵng", image: "https://picsum.photos/800/600?random=20", price: 3500000, rating: 5, features: ["Hồ bơi vô cực", "Spa", "Gym"] },
  { id: 102, name: "InterContinental Sun Peninsula", location: "Đà Nẵng", image: "https://picsum.photos/800/600?random=21", price: 8900000, rating: 5, features: ["Bãi biển riêng", "Nhà hàng Michelin", "Biệt thự"] },
  { id: 103, name: "Novotel Han River", location: "Đà Nẵng", image: "https://picsum.photos/800/600?random=22", price: 2100000, rating: 4, features: ["Bar 360", "Trung tâm TP", "View sông"] },
  { id: 104, name: "JW Marriott Emerald Bay", location: "Phú Quốc", image: "https://picsum.photos/800/600?random=23", price: 5500000, rating: 5, features: ["Kiến trúc độc đáo", "Bãi Kem", "Sang trọng"] },
];

// --- Extracted Components ---

interface HeaderProps {
  view: AppView;
  user: User | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  setView: (view: AppView) => void;
  handleBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, user, isMenuOpen, setIsMenuOpen, setView, handleBack }) => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-sky-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-3">
           {view !== AppView.HOME && (
             <button 
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-sky-50 text-sky-600 transition-colors"
              title="Quay lại"
             >
               <ArrowLeft className="h-6 w-6" />
             </button>
           )}
          <div className="flex items-center cursor-pointer" onClick={() => setView(AppView.HOME)}>
            <Plane className="h-8 w-8 text-sky-600 mr-2" />
            <span className="font-bold text-xl text-sky-900 tracking-tight">SkyAI</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 text-sky-800">
              <UserCircle />
              <span className="hidden md:block font-medium">{user.name}</span>
            </div>
          ) : (
            <button 
              onClick={() => setView(AppView.LOGIN)}
              className="hidden md:block px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-800"
            >
              Đăng nhập
            </button>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:text-sky-600">
            <Menu />
          </button>
        </div>
      </div>
    </div>
    
    {/* Mobile Menu Dropdown */}
    {isMenuOpen && (
      <div className="absolute top-16 right-0 w-64 bg-white shadow-xl border-l border-sky-50 h-screen p-4 flex flex-col gap-4 animate-fade-in-right">
         <button onClick={() => setView(AppView.LOGIN)} className="text-left px-4 py-2 hover:bg-sky-50 rounded-lg text-gray-700">Đăng nhập</button>
         <button className="text-left px-4 py-2 hover:bg-sky-50 rounded-lg text-gray-700">Đăng ký</button>
         <button className="text-left px-4 py-2 hover:bg-sky-50 rounded-lg text-gray-700">Giới thiệu</button>
         <button className="text-left px-4 py-2 hover:bg-sky-50 rounded-lg text-gray-700">Cài đặt</button>
         <div className="border-t pt-2 mt-2">
           <button onClick={() => setView(AppView.CHECK_IN)} className="w-full bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 mb-2">
             Check-in Vé máy bay
           </button>
           <button onClick={() => setView(AppView.HOTEL_FLOW)} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
             Đặt phòng Khách sạn
           </button>
         </div>
      </div>
    )}
  </header>
);

const Footer = () => (
  <footer className="bg-sky-900 text-sky-100 py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2"><Plane /> SkyAI Airlines</h3>
        <p className="text-sm text-sky-200">
          Hãng hàng không công nghệ cao hàng đầu Việt Nam. Trải nghiệm bay thông minh, an toàn và tiện lợi với AI
        </p>
      </div>
      <div>
        <h4 className="font-bold text-white mb-4">Về chúng tôi</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-white">Giới thiệu</a></li>
          <li><a href="#" className="hover:text-white">Tuyển dụng</a></li>
          <li><a href="#" className="hover:text-white">Tin tức</a></li>
        </ul>
      </div>
      <div>
         <h4 className="font-bold text-white mb-4">Hỗ trợ</h4>
         <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-white">Liên hệ</a></li>
          <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
          <li><a href="#" className="hover:text-white">Điều khoản sử dụng</a></li>
         </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-4">Tải ứng dụng</h4>
        <div className="flex gap-2">
          <div className="w-32 h-10 bg-black rounded-lg flex items-center justify-center border border-gray-700 cursor-pointer">
             <span className="text-xs">App Store</span>
          </div>
          <div className="w-32 h-10 bg-black rounded-lg flex items-center justify-center border border-gray-700 cursor-pointer">
             <span className="text-xs">Google Play</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

interface HomeViewProps {
  searchParams: { from: string; to: string; date: string };
  setSearchParams: React.Dispatch<React.SetStateAction<{ from: string; to: string; date: string }>>;
  setView: (view: AppView) => void;
  user: User | null;
  setSelectedFlight: (flight: Flight | null) => void;
  today: string;
  handleDateClick: (e: React.MouseEvent<HTMLInputElement>) => void;
  onSelectLocation: (location: typeof FEATURED_LOCATIONS[0]) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  searchParams, 
  setSearchParams, 
  setView, 
  user, 
  setSelectedFlight, 
  today, 
  handleDateClick,
  onSelectLocation
}) => (
  <div className="pb-20">
    {/* Hero Section */}
    <div className="relative bg-gradient-to-br from-sky-500 to-indigo-600 h-[500px] flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-5xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 drop-shadow-md">Khám phá thế giới cùng AI</h1>
        
        <div className="bg-white p-6 rounded-2xl shadow-2xl text-gray-800">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {/* Origin */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-500 mb-1">Điểm đi</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                   <input 
                    type="text" 
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-500 mb-1">Điểm đến</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                   <input 
                    type="text" 
                    value={searchParams.to}
                    onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngày đi</label>
                <div className="relative">
                   <Calendar className="absolute left-3 top-3 text-gray-400 h-5 w-5 pointer-events-none" />
                   <input 
                    type="date" 
                    value={searchParams.date}
                    min={today}
                    onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                    onClick={handleDateClick}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-gray-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setView(AppView.FLIGHT_RESULTS)}
              className="w-full lg:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search size={20} /> Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Featured Destinations */}
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <MapPin className="text-sky-600" /> Điểm đến nổi bật
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {FEATURED_LOCATIONS.map((loc) => (
          <div key={loc.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100 cursor-pointer" onClick={() => onSelectLocation(loc)}>
            <div className="relative h-48 overflow-hidden">
              <img src={loc.image} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <h3 className="text-white text-xl font-bold">{loc.name}</h3>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4 line-clamp-2">{loc.desc}</p>
              <div className="flex justify-between items-center">
                <span className="text-orange-500 font-bold text-sm">Từ {loc.priceFrom.toLocaleString()}đ</span>
                <button className="py-2 px-4 bg-sky-50 text-sky-600 font-semibold rounded-lg text-sm group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Flight Schedule Section (NEW) */}
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-sky-600" /> Lịch bay
        </h2>
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
          <span className="text-gray-500 font-medium whitespace-nowrap">Chọn ngày:</span>
          <input 
            type="date" 
            value={searchParams.date}
            min={today}
            onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
            onClick={handleDateClick}
            className="outline-none text-sky-700 font-bold bg-transparent cursor-pointer"
          />
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl shadow-md border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-sky-50">
              <tr className="text-sky-900 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Hãng bay</th>
                <th className="px-6 py-4 font-semibold">Từ</th>
                <th className="px-6 py-4 font-semibold">Đến</th>
                <th className="px-6 py-4 font-semibold">Giờ bay</th>
                <th className="px-6 py-4 font-semibold text-right">Giá vé</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_FLIGHTS.map((flight) => (
                <tr key={flight.id} className="hover:bg-sky-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sky-900">{flight.airline}</div>
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{flight.flightNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{flight.origin}</div>
                    <div className="text-sm text-sky-600 font-bold">{flight.departureTime}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="font-medium text-gray-900">{flight.destination}</div>
                     <div className="text-sm text-sky-600 font-bold">{flight.arrivalTime}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <span>2h 00m</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-orange-600">
                    {flight.price.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                       onClick={() => {
                        setSelectedFlight(flight);
                        if (!user) {
                          setView(AppView.LOGIN);
                        } else {
                          setView(AppView.CHECK_IN);
                        }
                      }}
                      className="bg-white border border-sky-200 text-sky-600 hover:bg-sky-600 hover:text-white hover:border-sky-600 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
                    >
                      Chọn vé
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
           <button onClick={() => setView(AppView.FLIGHT_RESULTS)} className="text-sky-600 font-medium hover:underline text-sm">Xem tất cả chuyến bay</button>
        </div>
      </div>
    </div>

    {/* Hotel & Resort Section */}
    <div className="bg-sky-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Khách sạn & Resort cao cấp</h2>
        <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-2xl shadow-sm">
           <div className="flex-1">
              <img src="https://picsum.photos/600/400?random=10" alt="Resort" className="w-full h-64 object-cover rounded-xl" />
           </div>
           <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Combo Nghỉ dưỡng 5 Sao</h3>
              <p className="text-gray-600 mb-6">Tận hưởng kỳ nghỉ trọn vẹn với ưu đãi đặt phòng giảm tới 30% khi đặt cùng vé máy bay.</p>
              <div className="flex gap-4">
                <button onClick={() => setView(AppView.HOTEL_FLOW)} className="bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700">Xem danh sách</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
);


// --- Main App Component ---

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Default to today's date
  const today = new Date().toISOString().split('T')[0];
  const [searchParams, setSearchParams] = useState({ 
    from: 'Hồ Chí Minh', 
    to: 'Hà Nội',
    date: today 
  });
  
  // Check-in State
  const [checkInStep, setCheckInStep] = useState<CheckInStep['step']>('face');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [idData, setIdData] = useState<IDCardData | null>(null);
  const [luggageData, setLuggageData] = useState<LuggageAnalysis | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<typeof FEATURED_LOCATIONS[0] | null>(null);
  
  // Hotel Flow State
  const [hotelStep, setHotelStep] = useState<HotelBookingStep['step']>('selection');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Confirmation State
  const [confirmationData, setConfirmationData] = useState<ConfirmationState | null>(null);

  // Helper to format date for display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const handleBack = () => {
    if (view === AppView.LUGGAGE_EXTRA) {
      setCheckInStep('luggage');
      setView(AppView.CHECK_IN);
    } else if (view === AppView.DESTINATION_DETAIL) {
      setView(AppView.HOME);
    } else if (view === AppView.CHECK_IN) {
        if (confirmationData) {
            setConfirmationData(null); // Back from confirmation to scanner
        } else if (checkInStep !== 'face') {
             // Simple logic to go back one step
             if (checkInStep === 'id') setCheckInStep('face');
             if (checkInStep === 'luggage') setCheckInStep('id');
             if (checkInStep === 'review') setCheckInStep('luggage');
        } else {
            setView(AppView.HOME);
        }
    } else if (view === AppView.HOTEL_FLOW) {
        if (confirmationData) {
            setConfirmationData(null);
        } else if (hotelStep === 'selection') {
            setView(AppView.HOME);
        } else if (hotelStep === 'face') {
            setHotelStep('selection');
        } else if (hotelStep === 'id') {
            setHotelStep('face');
        } else if (hotelStep === 'review') {
            setHotelStep('id');
        }
    } else {
      setView(AppView.HOME);
    }
  };

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      if (typeof e.currentTarget.showPicker === 'function') {
        e.currentTarget.showPicker();
      }
    } catch (error) {
      console.debug('Date picker not supported', error);
    }
  };

  const onSelectLocation = (loc: typeof FEATURED_LOCATIONS[0]) => {
    setSelectedLocation(loc);
    setView(AppView.DESTINATION_DETAIL);
  };

  const DestinationDetailView = () => {
    if (!selectedLocation) return null;

    return (
      <div className="bg-white min-h-screen pb-40">
        {/* Hero Image */}
        <div className="relative h-[40vh] lg:h-[50vh] w-full">
           <img src={selectedLocation.image} alt={selectedLocation.name} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
           <div className="absolute bottom-0 left-0 p-6 text-white">
              <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{selectedLocation.name}</h1>
              <div className="flex items-center gap-2 text-yellow-400">
                 <Star className="fill-yellow-400 w-5 h-5" />
                 <Star className="fill-yellow-400 w-5 h-5" />
                 <Star className="fill-yellow-400 w-5 h-5" />
                 <Star className="fill-yellow-400 w-5 h-5" />
                 <Star className="fill-yellow-400 w-5 h-5" />
                 <span className="text-white text-sm ml-2">(4.9/5 đánh giá)</span>
              </div>
           </div>
           <button 
            onClick={handleBack} 
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-colors"
           >
             <ArrowLeft size={24} />
           </button>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
           {/* Description */}
           <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tổng quan</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {selectedLocation.longDesc}
              </p>
           </div>

           {/* Highlights */}
           <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Điểm đến nổi bật</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {selectedLocation.highlights?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
                       <div className="bg-white p-2 rounded-full shadow-sm text-sky-600">
                          <Umbrella size={20} />
                       </div>
                       <span className="font-medium text-sky-900">{item}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Gallery Preview */}
           <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thư viện ảnh</h2>
              <div className="grid grid-cols-3 gap-2 h-48">
                 <div className="col-span-2 h-full rounded-l-xl overflow-hidden">
                    <img src={`https://picsum.photos/600/400?random=${selectedLocation.id * 10}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Gallery 1" />
                 </div>
                 <div className="flex flex-col gap-2 h-full">
                    <div className="h-1/2 rounded-tr-xl overflow-hidden">
                      <img src={`https://picsum.photos/600/400?random=${selectedLocation.id * 11}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Gallery 2" />
                    </div>
                    <div className="h-1/2 rounded-br-xl overflow-hidden relative group cursor-pointer">
                      <img src={`https://picsum.photos/600/400?random=${selectedLocation.id * 12}`} className="w-full h-full object-cover" alt="Gallery 3" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                         <div className="text-white font-medium flex items-center gap-1">
                            <Camera size={16} /> +12 ảnh
                         </div>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sticky Booking Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 safe-area-pb z-40">
           <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                 <p className="text-sm text-gray-500">Giá vé máy bay từ</p>
                 <p className="text-2xl font-bold text-orange-600">{selectedLocation.priceFrom.toLocaleString()}đ</p>
              </div>
              <button 
                onClick={() => {
                   setSearchParams({ ...searchParams, to: selectedLocation.name });
                   setView(AppView.FLIGHT_RESULTS);
                }}
                className="bg-sky-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-700 shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                 Đặt vé ngay <ArrowRight size={20} />
              </button>
           </div>
        </div>
      </div>
    );
  };

  const HotelFlowView = () => {
      // Re-use logic for Face and ID
      const handleFaceCheck = async (imageSrc: string | string[]) => {
          if (Array.isArray(imageSrc)) return;
          setProcessing(true);
          setLoadingText("Đang phân tích vật cản & đối chiếu...");
          let result: FaceAnalysisResult;
          if (user?.faceDataset && user.faceDataset.length > 0) {
              result = await verifyIdentity(imageSrc, user.faceDataset);
          } else {
              result = await verifyFace(imageSrc);
          }
          setProcessing(false);
          setConfirmationData({ step: 'face', imageSrc: imageSrc, data: result });
      };

      const handleIDScan = async (imageSrc: string | string[]) => {
          if (Array.isArray(imageSrc)) return;
          setProcessing(true);
          setLoadingText("Đang trích xuất thông tin CCCD...");
          try {
              const data = await analyzeIDCard(imageSrc);
              setProcessing(false);
              setConfirmationData({ step: 'id', imageSrc: imageSrc, data: data });
          } catch (e) {
              setProcessing(false);
              alert("Lỗi xử lý AI");
          }
      };

      const handleConfirmNext = () => {
          if (!confirmationData) return;
          if (confirmationData.step === 'face') {
              const res = confirmationData.data as FaceAnalysisResult;
              if (res.hasObstruction) return;
              if (!res.match) {
                  alert("Khuôn mặt không khớp! Vui lòng thử lại.");
                  setConfirmationData(null);
                  return;
              }
              setHotelStep('id');
          } else if (confirmationData.step === 'id') {
              const res = confirmationData.data as IDCardData;
              if (!res.isValid) {
                  alert("CCCD không hợp lệ. Vui lòng thử lại.");
                  setConfirmationData(null);
                  return;
              }
              setIdData(res);
              setHotelStep('review');
          }
          setConfirmationData(null);
      };

      const renderConfirmation = () => {
        if (!confirmationData) return null;
        const { step, imageSrc, data } = confirmationData;
        let title = "";
        let content = null;
        let canContinue = true;

        if (step === 'face') {
            const res = data as FaceAnalysisResult;
            title = "Xác nhận khuôn mặt";
            if (res.hasObstruction) {
                canContinue = false;
                content = (
                    <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200 text-red-700 animate-pulse text-center">
                        <div className="flex flex-col items-center justify-center gap-3 font-bold text-2xl mb-4 text-red-800">
                            <AlertTriangle size={48} /> <span>Vui lòng cởi bỏ vật cản</span>
                        </div>
                        <p className="text-xl font-bold mb-4">"{res.obstructionDetail}"</p>
                        <p className="text-base text-gray-700">Hệ thống không thể nhận diện khi bạn đang đeo kính, khẩu trang hoặc nón. <br/>Vui lòng tháo bỏ để hệ thống quét lại.</p>
                    </div>
                );
            } else if (!res.match) {
                canContinue = false;
                content = <div className="bg-red-50 p-4 rounded-lg text-red-700 font-bold">Không trùng khớp</div>;
            } else {
                content = <div className="bg-green-50 p-4 rounded-lg text-green-800 font-bold flex items-center gap-2"><CheckCircle/> Hợp lệ</div>;
            }
        } else if (step === 'id') {
             const res = data as IDCardData;
             title = "Xác nhận thông tin";
             content = (
                <div className="bg-sky-50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm">Họ và tên</p>
                    <p className="font-bold text-lg">{res.name}</p>
                    <p className="text-gray-500 text-sm mt-2">Số CCCD</p>
                    <p className="font-bold text-lg">{res.idNumber}</p>
                </div>
             );
             canContinue = res.isValid;
        }

        return (
            <div className="text-center animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-6">
                    <div className="w-full md:w-1/2 max-w-xs rounded-xl overflow-hidden shadow-md"><img src={imageSrc} className="w-full"/></div>
                    <div className="w-full md:w-1/2 text-left">{content}</div>
                </div>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setConfirmationData(null)} className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-md ${!canContinue ? 'bg-red-600 text-white w-full justify-center' : 'bg-white border'}`}><RefreshCw size={18} /> {canContinue ? "Chụp lại" : "QUÉT LẠI NGAY"}</button>
                    {canContinue && <button onClick={handleConfirmNext} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg">Tiếp tục <ArrowRight size={18} /></button>}
                </div>
            </div>
        );
      };

      if (hotelStep === 'selection') {
          return (
              <div className="max-w-7xl mx-auto px-4 py-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Building className="text-indigo-600"/> Khách sạn & Resort cao cấp</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {MOCK_HOTELS.map(hotel => (
                          <div key={hotel.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all">
                              <div className="h-64 relative">
                                  <img src={hotel.image} className="w-full h-full object-cover" alt={hotel.name}/>
                                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {hotel.rating}.0
                                  </div>
                              </div>
                              <div className="p-6 flex-grow flex flex-col justify-between">
                                  <div>
                                      <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                                      <p className="text-gray-500 flex items-center gap-1 text-sm mb-4"><MapPin size={14}/> {hotel.location}</p>
                                      <div className="flex gap-2 mb-4 flex-wrap">
                                          {hotel.features.map(f => (
                                              <span key={f} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">{f}</span>
                                          ))}
                                      </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-4 border-t pt-4">
                                      <div>
                                          <p className="text-xs text-gray-400">Giá mỗi đêm từ</p>
                                          <p className="text-2xl font-bold text-orange-600">{hotel.price.toLocaleString()}đ</p>
                                      </div>
                                      <button 
                                          onClick={() => {
                                              if(!user) { setView(AppView.LOGIN); return; }
                                              setSelectedHotel(hotel);
                                              setHotelStep('face');
                                          }}
                                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md"
                                      >
                                          Đặt phòng ngay
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          );
      }

      // Reuse Stepper Logic
      const steps = [
        { id: 'face', title: 'Xác thực sinh trắc học', icon: ScanFace },
        { id: 'id', title: 'Quét CCCD', icon: Briefcase }, 
        { id: 'review', title: 'Nhận phòng', icon: Key },
      ];

      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
           <div className="text-center mb-8">
             <h2 className="text-2xl font-bold">Smart Booking: {selectedHotel?.name}</h2>
             <p className="text-gray-500">Quy trình đặt phòng và nhận khóa số tự động</p>
           </div>
           
           <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                {steps.map((s, idx) => {
                    const active = hotelStep === s.id;
                    const passed = steps.findIndex(st => st.id === hotelStep) > idx;
                    return (
                    <div key={s.id} className={`flex flex-col items-center bg-gray-50 px-2`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active || passed ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                        <s.icon size={20} />
                        </div>
                        <span className={`text-xs mt-2 font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}>{s.title}</span>
                    </div>
                    )
                })}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg min-h-[400px] relative">
               {processing && (
                   <div className="absolute inset-0 bg-white/90 z-30 flex flex-col items-center justify-center rounded-2xl">
                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                       <p className="text-indigo-800 font-medium animate-pulse">{loadingText}</p>
                   </div>
               )}

               {confirmationData ? renderConfirmation() : (
                   <>
                       {hotelStep === 'face' && (
                           <div className="text-center">
                               <h3 className="text-xl font-bold mb-2">Bước 1: Xác thực danh tính</h3>
                               <div className="bg-yellow-50 p-3 rounded-lg inline-block mb-4 text-yellow-800 text-sm">
                                   <AlertTriangle size={16} className="inline mr-1"/> Lưu ý: Vui lòng tháo kính, khẩu trang và nón.
                               </div>
                               <CameraCapture label="Quét khuôn mặt" instruction="Nhìn thẳng vào camera" onCapture={handleFaceCheck} mode="single" />
                           </div>
                       )}
                       {hotelStep === 'id' && (
                           <div className="text-center">
                               <h3 className="text-xl font-bold mb-4">Bước 2: Quét CCCD</h3>
                               <CameraCapture label="Chụp mặt trước CCCD" instruction="Đặt thẻ vào khung hình" facingMode="environment" onCapture={handleIDScan} mode="single" />
                           </div>
                       )}
                       {hotelStep === 'review' && (
                           <div className="text-center py-4">
                               <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 max-w-sm mx-auto shadow-2xl relative overflow-hidden border border-gray-800">
                                   <div className="absolute top-0 right-0 p-4 opacity-10"><Building size={120} /></div>
                                   <div className="relative z-10">
                                       <div className="flex justify-between items-start mb-8">
                                            <div className="text-left">
                                                <p className="text-indigo-300 text-xs uppercase tracking-widest mb-1">DIGITAL KEY</p>
                                                <h3 className="text-2xl font-bold">{selectedHotel?.name}</h3>
                                            </div>
                                            <Key className="text-yellow-400" size={32} />
                                       </div>
                                       
                                       <div className="grid grid-cols-2 gap-6 text-left mb-8">
                                            <div>
                                                <p className="text-indigo-400 text-xs uppercase">Guest</p>
                                                <p className="font-bold text-lg">{idData?.name || user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-indigo-400 text-xs uppercase">Room</p>
                                                <p className="font-bold text-2xl text-white">405</p>
                                            </div>
                                            <div>
                                                <p className="text-indigo-400 text-xs uppercase">Check-in</p>
                                                <p className="font-bold">{formatDateDisplay(searchParams.date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-indigo-400 text-xs uppercase">Nights</p>
                                                <p className="font-bold">2</p>
                                            </div>
                                       </div>

                                       <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HOTEL-${selectedHotel?.id}-${idData?.idNumber}`} className="w-32 h-32" />
                                       </div>
                                       <p className="text-indigo-300 text-xs mt-4">Quét mã này tại quầy lễ tân hoặc cửa phòng</p>
                                   </div>
                               </div>

                               <div className="mt-8">
                                   <h3 className="text-green-600 font-bold text-xl flex items-center justify-center gap-2"><CheckCircle/> Đặt phòng thành công</h3>
                                   <p className="text-gray-500 mt-2">Mã đặt phòng và khóa số đã được gửi vào email.</p>
                                   <button onClick={() => setView(AppView.HOME)} className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700">Về trang chủ</button>
                               </div>
                           </div>
                       )}
                   </>
               )}
            </div>
        </div>
      );
  };

  const LoginView = () => {
    const [loginStep, setLoginStep] = useState<'credentials' | 'face_setup'>('credentials');
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [obstructionError, setObstructionError] = useState<{detected: boolean, detail: string} | null>(null);

    const handleCredentialsSubmit = () => {
        if (!emailInput) return alert("Vui lòng nhập Email");
        setLoginStep('face_setup');
    };

    const handleFaceCompletion = async (images: string | string[]) => {
      if (!Array.isArray(images) || images.length === 0) return;

      setProcessing(true);
      setLoadingText("Đang kiểm tra vật cản & tạo hồ sơ...");
      
      // PRE-CHECK: Pick one image to check for obstructions BEFORE training
      const sampleImage = images[Math.floor(images.length / 2)];
      const preCheck = await verifyFace(sampleImage);

      if (preCheck.hasObstruction) {
         setProcessing(false);
         setObstructionError({
             detected: true,
             detail: preCheck.obstructionDetail
         });
         return; // STOP here, do not train
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const trainedModel = await trainFaceModel(images);
      
      setProcessing(false);
      setUser({ 
        email: emailInput || 'user@gmail.com', 
        name: (emailInput.split('@')[0]) || 'Người dùng', 
        isAuthenticated: true,
        faceDataset: trainedModel 
      });
      alert("Đăng nhập & Xác thực khuôn mặt thành công!");
      setView(AppView.HOME);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
        <button 
          onClick={() => {
            if (loginStep === 'face_setup') {
              setLoginStep('credentials'); 
            } else {
              setView(AppView.HOME); 
            }
          }}
          className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-sky-600 z-10"
        >
           <ArrowLeft size={24} />
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transition-all duration-300">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 gap-2">
            <div className={`h-2 rounded-full w-12 transition-colors ${loginStep === 'credentials' ? 'bg-sky-600' : 'bg-green-500'}`}></div>
            <div className={`h-2 rounded-full w-12 transition-colors ${loginStep === 'face_setup' ? 'bg-sky-600' : 'bg-gray-200'}`}></div>
          </div>

          {loginStep === 'credentials' ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng nhập / Đăng ký</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email / Gmail</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                      <input 
                        type="email" 
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="vidu@gmail.com"
                        className="pl-10 w-full p-3 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                   </div>
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                      <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 w-full p-3 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                   </div>
                </div>

                <button 
                    onClick={handleCredentialsSubmit}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                >
                    Tiếp tục <ArrowRight size={18} />
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">hoặc</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="space-y-4 mb-6">
                <button 
                  onClick={() => {
                    setEmailInput('googleuser@gmail.com');
                    setLoginStep('face_setup');
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Đăng nhập với Google
                </button>
              </div>
            </>
          ) : (
            <>
              {obstructionError ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in">
                      <div className="bg-red-100 p-4 rounded-full mb-4">
                          <AlertTriangle className="w-16 h-16 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-red-700 mb-2">Vui lòng cởi bỏ vật cản!</h3>
                      <p className="text-gray-700 font-semibold mb-2 text-lg">"{obstructionError.detail}"</p>
                      <p className="text-gray-500 mb-8 max-w-xs">
                          Hệ thống không thể nhận diện khi bạn đang đeo kính, khẩu trang hoặc nón. Vui lòng tháo bỏ để tiếp tục.
                      </p>
                      <button 
                          onClick={() => setObstructionError(null)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                          <RefreshCw /> Quét lại ngay
                      </button>
                  </div>
              ) : (
                  <>
                    <div className="text-center mb-4">
                        <ShieldCheck className="w-12 h-12 text-sky-600 mx-auto mb-2" />
                        <h2 className="text-2xl font-bold text-gray-800">Xác thực sinh trắc học</h2>
                        <p className="text-gray-500 text-sm mt-2">
                        Vui lòng <span className="text-red-600 font-bold">tháo kính, khẩu trang, mũ</span> để hệ thống nhận diện.
                        </p>
                        <p className="text-xs text-sky-600 mt-1 font-semibold">
                        Hệ thống sẽ thu thập 50 mẫu ảnh để huấn luyện AI.
                        </p>
                    </div>
                    
                    <div className="mt-4">
                        {processing ? (
                            <div className="flex flex-col items-center justify-center py-8">
                            <Database className="w-12 h-12 text-sky-600 animate-bounce mb-4" />
                            <div className="text-sky-600 font-medium text-center">{loadingText}</div>
                            </div>
                        ) : (
                            <CameraCapture 
                            label="Quét dữ liệu khuôn mặt" 
                            instruction="Nhấn bắt đầu và xoay nhẹ khuôn mặt" 
                            onCapture={handleFaceCompletion}
                            mode="training"
                            />
                        )}
                    </div>
                  </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const FlightResultsView = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">
             Chuyến bay từ {searchParams.from} đến {searchParams.to}
           </h2>
           <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Calendar size={16} /> Ngày bay: <span className="font-semibold text-sky-600">{formatDateDisplay(searchParams.date)}</span>
           </p>
        </div>
        <button onClick={() => setView(AppView.HOME)} className="text-sky-600 hover:underline">Thay đổi tìm kiếm</button>
      </div>

      <div className="space-y-4">
        {MOCK_FLIGHTS.map((flight) => (
          <div key={flight.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <Plane className="text-sky-600" />
              </div>
              <div>
                <div className="font-bold text-lg">{flight.airline}</div>
                <div className="text-sm text-gray-500">{flight.flightNumber}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-center">
              <div>
                <div className="font-bold text-xl">{flight.departureTime}</div>
                <div className="text-xs text-gray-500">{flight.origin}</div>
              </div>
              <div className="text-gray-300 flex flex-col items-center">
                 <span className="text-xs">2h 00m</span>
                 <div className="w-20 h-px bg-gray-300 relative">
                   <div className="absolute -right-1 -top-1 w-2 h-2 border-t border-r border-gray-300 transform rotate-45"></div>
                 </div>
              </div>
              <div>
                <div className="font-bold text-xl">{flight.arrivalTime}</div>
                <div className="text-xs text-gray-500">{flight.destination}</div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              <div className="text-orange-600 font-bold text-xl">
                {flight.price.toLocaleString()} VND
              </div>
              <button 
                onClick={() => {
                  if (!user) {
                    setView(AppView.LOGIN);
                  } else {
                    setSelectedFlight(flight);
                    setView(AppView.CHECK_IN);
                  }
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full"
              >
                Chọn vé
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CheckInView = () => {
    // 1. Face Scan Logic
    const handleFaceCheck = async (imageSrc: string | string[]) => {
      if (Array.isArray(imageSrc)) return;

      setProcessing(true);
      setLoadingText("Đang phân tích vật cản & đối chiếu...");

      let result: FaceAnalysisResult;

      if (user?.faceDataset && user.faceDataset.length > 0) {
         result = await verifyIdentity(imageSrc, user.faceDataset);
      } else {
         result = await verifyFace(imageSrc);
      }
      
      setProcessing(false);
      setConfirmationData({
          step: 'face',
          imageSrc: imageSrc,
          data: result
      });
    };

    // 2. ID Scan Logic
    const handleIDScan = async (imageSrc: string | string[]) => {
      if (Array.isArray(imageSrc)) return;

      setProcessing(true);
      setLoadingText("Đang trích xuất thông tin CCCD...");
      try {
        const data = await analyzeIDCard(imageSrc);
        setProcessing(false);
        setConfirmationData({
            step: 'id',
            imageSrc: imageSrc,
            data: data
        });
      } catch (e) {
        setProcessing(false);
        alert("Lỗi xử lý AI");
      }
    };

    // 3. Luggage Scan Logic
    const handleLuggageScan = async (imageSrc: string | string[]) => {
      if (Array.isArray(imageSrc)) return;

      setProcessing(true);
      setLoadingText("AI đang nhận diện vật thể & tính khối lượng...");
      try {
        const data = await analyzeLuggage(imageSrc);
        setProcessing(false);
        setConfirmationData({
            step: 'luggage',
            imageSrc: imageSrc,
            data: data
        });
      } catch (e) {
        setProcessing(false);
      }
    };

    const handleConfirmNext = () => {
        if (!confirmationData) return;

        if (confirmationData.step === 'face') {
            const res = confirmationData.data as FaceAnalysisResult;
            if (res.hasObstruction) {
               // Cannot continue if obstructed
               return;
            }
            if (!res.match) {
                alert("Khuôn mặt không khớp! Vui lòng thử lại.");
                setConfirmationData(null);
                return;
            }
            setCheckInStep('id');
        } else if (confirmationData.step === 'id') {
            const res = confirmationData.data as IDCardData;
            if (!res.isValid) {
                alert("CCCD không hợp lệ. Vui lòng thử lại.");
                setConfirmationData(null);
                return;
            }
            setIdData(res);
            setCheckInStep('luggage');
        } else if (confirmationData.step === 'luggage') {
             const res = confirmationData.data as LuggageAnalysis;
             setLuggageData(res);
             if (res.isCarryOnCompliant) {
                setCheckInStep('review');
             } else {
                setView(AppView.LUGGAGE_EXTRA);
             }
        }
        setConfirmationData(null);
    };

    const renderConfirmation = () => {
        if (!confirmationData) return null;
        const { step, imageSrc, data } = confirmationData;

        let title = "";
        let content = null;
        let canContinue = true;

        if (step === 'face') {
            const res = data as FaceAnalysisResult;
            title = "Xác nhận khuôn mặt";
            
            if (res.hasObstruction) {
                canContinue = false;
                content = (
                    <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200 text-red-700 animate-pulse text-center">
                        <div className="flex flex-col items-center justify-center gap-3 font-bold text-2xl mb-4 text-red-800">
                            <AlertTriangle size={48} /> 
                            <span>Vui lòng cởi bỏ vật cản</span>
                        </div>
                        <p className="text-xl font-bold mb-4">"{res.obstructionDetail}"</p>
                        <p className="text-base text-gray-700">
                           Hệ thống không thể nhận diện khi bạn đang đeo kính, khẩu trang hoặc nón.
                           <br/>Vui lòng tháo bỏ để hệ thống quét lại.
                        </p>
                    </div>
                );
            } else if (!res.match) {
                canContinue = false;
                content = (
                     <div className="bg-red-50 p-4 rounded-lg text-red-700">
                        <div className="flex items-center gap-2 font-bold text-lg mb-2">
                            <X /> Không trùng khớp
                        </div>
                        <p>Khuôn mặt không khớp với dữ liệu đã đăng ký.</p>
                    </div>
                );
            } else {
                content = (
                    <div className="bg-green-50 p-4 rounded-lg text-green-800">
                        <div className="flex items-center gap-2 font-bold text-lg mb-2">
                            <CheckCircle /> Hợp lệ
                        </div>
                        <p>Đã xác thực danh tính thành công.</p>
                    </div>
                );
            }
        } else if (step === 'id') {
            const res = data as IDCardData;
            title = "Xác nhận thông tin CCCD";
            content = (
                <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                    <div className="space-y-2">
                        <p className="text-gray-500 text-sm">Họ và tên</p>
                        <p className="font-bold text-lg text-gray-900">{res.name || "Không đọc được"}</p>
                        <p className="text-gray-500 text-sm mt-2">Số CCCD</p>
                        <p className="font-bold text-lg text-gray-900">{res.idNumber || "Không đọc được"}</p>
                    </div>
                    {!res.isValid && <p className="text-red-500 text-sm mt-2 font-bold">Không phát hiện thẻ hợp lệ.</p>}
                </div>
            );
            canContinue = res.isValid;
        } else if (step === 'luggage') {
            const res = data as LuggageAnalysis;
            title = "Kết quả quét hành lý";
            content = (
                <div className={`${res.isCarryOnCompliant ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border p-4 rounded-lg`}>
                     <div className="mb-2">
                        <span className="text-gray-600 text-sm">Vật thể:</span>
                        <p className="font-bold text-lg">{res.objectDescription}</p>
                     </div>
                     <div className="mb-2">
                        <span className="text-gray-600 text-sm">Khối lượng ước tính:</span>
                        <p className="font-bold text-xl">{res.estimatedWeight} kg</p>
                     </div>
                     {!res.isCarryOnCompliant && (
                         <p className="text-red-600 text-sm font-bold mt-2"><AlertTriangle size={16} className="inline mr-1"/> {res.reason}</p>
                     )}
                </div>
            );
        }

        return (
            <div className="text-center animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                
                <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-6">
                    <div className="w-full md:w-1/2 max-w-xs rounded-xl overflow-hidden shadow-md border border-gray-200">
                        <img src={imageSrc} alt="Captured" className="w-full h-auto" />
                    </div>
                    <div className="w-full md:w-1/2 text-left">
                        {content}
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => setConfirmationData(null)} 
                        className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 ${!canContinue ? 'bg-red-600 text-white hover:bg-red-700 w-full justify-center' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <RefreshCw size={18} /> {canContinue ? "Chụp lại" : "QUÉT LẠI NGAY"}
                    </button>
                    {canContinue && (
                        <button 
                            onClick={handleConfirmNext} 
                            className="px-8 py-3 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 flex items-center gap-2 shadow-lg"
                        >
                            Tiếp tục <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const steps = [
      { id: 'face', title: 'Xác thực khuôn mặt', icon: ScanFace },
      { id: 'id', title: 'Quét CCCD', icon: Briefcase }, 
      { id: 'luggage', title: 'Kiểm tra hành lý', icon: Briefcase },
    ];

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Smart Check-in</h2>
        
        {/* Stepper */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          {steps.map((s, idx) => {
             const active = checkInStep === s.id;
             const passed = steps.findIndex(st => st.id === checkInStep) > idx;
             return (
               <div key={s.id} className={`flex flex-col items-center bg-gray-50 px-2`}>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active || passed ? 'bg-sky-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
                   <s.icon size={20} />
                 </div>
                 <span className={`text-xs mt-2 font-medium ${active ? 'text-sky-600' : 'text-gray-500'}`}>{s.title}</span>
               </div>
             )
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white p-6 rounded-2xl shadow-lg min-h-[400px] relative">
          {processing && (
            <div className="absolute inset-0 bg-white/90 z-30 flex flex-col items-center justify-center rounded-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4"></div>
              <p className="text-sky-800 font-medium animate-pulse">{loadingText}</p>
            </div>
          )}

          {confirmationData ? renderConfirmation() : (
             <>
                {checkInStep === 'face' && (
                    <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Bước 1: Xác thực sinh trắc học</h3>
                    <div className="bg-yellow-50 p-3 rounded-lg inline-block mb-4 text-yellow-800 text-sm">
                        <AlertTriangle size={16} className="inline mr-1"/> Lưu ý: Vui lòng tháo kính, khẩu trang và nón.
                    </div>
                    <CameraCapture 
                        label="Quét khuôn mặt" 
                        instruction="Vui lòng nhìn thẳng vào camera"
                        onCapture={handleFaceCheck}
                        mode="single"
                    />
                    </div>
                )}

                {checkInStep === 'id' && (
                    <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">Bước 2: Xác thực giấy tờ tùy thân</h3>
                    <CameraCapture 
                        label="Chụp mặt trước CCCD" 
                        instruction="Đặt thẻ CCCD vào khung hình, đảm bảo đủ sáng"
                        facingMode='environment'
                        onCapture={handleIDScan}
                        mode="single"
                    />
                    </div>
                )}

                {checkInStep === 'luggage' && (
                    <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">Bước 3: Kiểm tra hành lý xách tay</h3>
                    <p className="text-gray-500 mb-4">Quy định: Tối đa 7kg, kích thước 56x36x23cm.</p>
                    <CameraCapture 
                        label="Chụp ảnh hành lý" 
                        instruction="Đặt hành lý trên mặt phẳng, chụp toàn bộ vali/balo"
                        facingMode='environment'
                        onCapture={handleLuggageScan}
                        mode="single"
                    />
                    </div>
                )}

                {checkInStep === 'review' && (
                    <div className="text-center py-8 w-full">
                    
                    {/* Digital Boarding Pass UI */}
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm mx-auto border border-gray-100 relative">
                        {/* Top Section: Flight Route */}
                        <div className="bg-sky-600 p-6 text-white relative">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-1">
                                <Plane className="h-5 w-5" />
                                <span className="font-bold tracking-wider text-sm">SkyAI BOARDING PASS</span>
                            </div>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">ECONOMY</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <div className="text-left">
                                <div className="text-3xl font-bold">{selectedFlight?.origin === 'Hồ Chí Minh' ? 'SGN' : 'HAN'}</div>
                                <div className="text-sky-100 text-sm">{selectedFlight?.origin}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <Plane className="rotate-90 mb-1 opacity-80" />
                                <div className="w-12 border-t border-dashed border-sky-300/50"></div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">{selectedFlight?.destination === 'Hà Nội' ? 'HAN' : 'DAD'}</div>
                                <div className="text-sky-100 text-sm">{selectedFlight?.destination}</div>
                            </div>
                        </div>
                        </div>

                        {/* Middle Section: Details */}
                        <div className="p-6 bg-white relative">
                        {/* Notches for ticket effect */}
                        <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"></div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Hành khách / Passenger</p>
                                <p className="font-bold text-gray-800 truncate">{idData?.name || user?.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase">Ngày / Date</p>
                                <p className="font-bold text-gray-800">{formatDateDisplay(searchParams.date)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Chuyến bay / Flight</p>
                                <p className="font-bold text-gray-800">{selectedFlight?.flightNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase">Giờ / Time</p>
                                <p className="font-bold text-gray-800">{selectedFlight?.departureTime}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Hành lý / Baggage</p>
                                <p className="font-bold text-gray-800">{luggageData?.estimatedWeight} kg</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase">Ghế / Seat</p>
                                <p className="font-bold text-sky-600 text-xl">12A</p>
                            </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="border-t border-dashed border-gray-200 pt-6 flex flex-col items-center">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SKYAI-${selectedFlight?.flightNumber}-${idData?.idNumber || 'USER'}`}
                                alt="QR Code"
                                className="w-32 h-32 mix-blend-multiply"
                            />
                            <p className="text-xs text-gray-400 mt-2">Quét mã này tại cửa ra máy bay</p>
                        </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="mt-8 px-4">
                        <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl">Check-in thành công</span>
                        </div>
                        <p className="text-gray-600 text-lg">
                        Vé máy bay của bạn đã được xử lý và sẽ gửi qua gmail.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setView(AppView.HOME)}
                        className="mt-8 bg-sky-900 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-sky-800 hover:shadow-xl transition-all transform hover:-translate-y-1"
                    >
                        Về trang chủ
                    </button>
                    </div>
                )}
             </>
          )}
        </div>
      </div>
    );
  };

  const LuggageExtraView = () => (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Hành lý vượt quá quy định xách tay</h2>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg w-full">
            <div className="flex justify-between items-center mb-2">
               <span className="text-gray-600">Vật thể:</span>
               <span className="font-bold text-gray-900">{luggageData?.objectDescription || 'Không xác định'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
               <span className="text-gray-600">Khối lượng:</span>
               <span className="font-bold text-red-600 text-xl">{luggageData?.estimatedWeight} kg</span>
            </div>
            <p className="text-sm text-red-500 mt-2 italic">{luggageData?.reason}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl mb-8">
           <h3 className="font-bold text-lg mb-4">Đăng ký hành lý ký gửi ngay để tiết kiệm 20%</h3>
           <div className="space-y-3">
             <label className="flex items-center justify-between p-4 bg-white border rounded-lg cursor-pointer hover:border-sky-500">
               <div className="flex items-center gap-3">
                 <input type="radio" name="baggage" className="w-5 h-5 text-sky-600" />
                 <span>Gói 15kg</span>
               </div>
               <span className="font-bold text-sky-700">150.000 VND</span>
             </label>
             <label className="flex items-center justify-between p-4 bg-white border rounded-lg cursor-pointer hover:border-sky-500">
               <div className="flex items-center gap-3">
                 <input type="radio" name="baggage" defaultChecked className="w-5 h-5 text-sky-600" />
                 <span>Gói 23kg</span>
               </div>
               <span className="font-bold text-sky-700">250.000 VND</span>
             </label>
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => {
              setCheckInStep('review');
              setView(AppView.CHECK_IN);
            }}
            className="flex-1 bg-sky-600 text-white py-3 rounded-lg font-bold hover:bg-sky-700"
          >
            Mua thêm & Tiếp tục
          </button>
           <button 
            onClick={() => {
               setCheckInStep('luggage');
               setView(AppView.CHECK_IN);
            }}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
          >
            Quét lại hành lý
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {view !== AppView.LOGIN && (
        <Header 
          view={view} 
          user={user} 
          isMenuOpen={isMenuOpen} 
          setIsMenuOpen={setIsMenuOpen} 
          setView={setView} 
          handleBack={handleBack} 
        />
      )}
      
      <main className="flex-grow">
        {view === AppView.HOME && (
          <HomeView 
            searchParams={searchParams} 
            setSearchParams={setSearchParams} 
            setView={setView} 
            user={user} 
            setSelectedFlight={setSelectedFlight} 
            today={today} 
            handleDateClick={handleDateClick} 
            onSelectLocation={onSelectLocation}
          />
        )}
        {view === AppView.LOGIN && <LoginView />}
        {view === AppView.FLIGHT_RESULTS && <FlightResultsView />}
        {view === AppView.CHECK_IN && <CheckInView />}
        {view === AppView.LUGGAGE_EXTRA && <LuggageExtraView />}
        {view === AppView.DESTINATION_DETAIL && <DestinationDetailView />}
        {view === AppView.HOTEL_FLOW && <HotelFlowView />}
      </main>

      {view !== AppView.LOGIN && <Footer />}
    </div>
  );
}

export default App;
