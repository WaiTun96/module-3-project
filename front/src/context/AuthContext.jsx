import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // App စဖွင့်ချိန်တွင် LocalStorage ထဲရှိ Token နှင့် Admin Data ကို စစ်ဆေးခြင်း
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('adminInfo');

    if (token && storedAdmin && storedAdmin !== 'undefined') {
      try {
        setAdmin(JSON.parse(storedAdmin));
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing adminInfo from localStorage:', error);
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Register Function ( Admin အကောင့်အသစ်ဖွင့်ရန် )
  const register = async (username, email, password) => {
    const response = await API.post('/auth/register', { username, email, password });
    return response.data;
  };

  // Login Function
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    
    const { token } = response.data;
    // Backend က 'user' သို့မဟုတ် 'admin' Key နာမည် ဘယ်လိုပဲပြန်ပေးပေး ရအောင်ယူခြင်း
    const adminData = response.data.admin || response.data.user;

    if (token && adminData) {
      localStorage.setItem('token', token);
      localStorage.setItem('adminInfo', JSON.stringify(adminData));
      
      // Axios Instance Header တွင် Token ထည့်သွင်းခြင်း
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAdmin(adminData);
    }

    return response.data;
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminInfo');
    delete API.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, register, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);