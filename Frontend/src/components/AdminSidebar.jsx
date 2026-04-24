import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, MapPin, Car, Users, LogOut, 
  Settings, ChevronLeft, UserCircle 
} from 'lucide-react';

const AdminSidebar = ({ role }) => {
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: role === 'super_admin' ? '/super-admin' : '/admin' },
    { name: 'Joylar (POI)', icon: <MapPin size={20} />, path: '/manage-locations' },
    { name: 'Parkovkalar', icon: <Car size={20} />, path: '/manage-parkings' },
    { name: 'Haydovchilar', icon: <Users size={20} />, path: '/manage-users' },
  ];

  if (role === 'super_admin') {
    menuItems.push({ name: 'Adminlar', icon: <UserCircle size={20} />, path: '/manage-admins' });
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-[#0d1b2a] border-r border-white/5 flex flex-col shrink-0 fixed left-0 top-0 z-[100]">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 bg-festival-pink rounded-xl flex items-center justify-center shadow-lg shadow-festival-pink/20">
          <Settings size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-widest">Admin</h1>
          <p className="text-[10px] text-white/30 font-bold uppercase">{role?.replace('_', ' ')}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4 text-white">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                isActive 
                  ? 'bg-festival-pink text-white shadow-lg shadow-festival-pink/20' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-festival-pink hover:bg-festival-pink/10 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
