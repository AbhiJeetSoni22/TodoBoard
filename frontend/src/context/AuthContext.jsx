import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true); // <--- NEW
  const haveToken = !!localStorage.getItem('token')
  useEffect(() => {
    const token =  localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        const newSocket = io(import.meta.env.VITE_API_URL, {
          auth: { token },
        });
        setSocket(newSocket);

        return () => newSocket.disconnect();
      } catch (err) {
        console.error("Failed to parse user:", err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoading(false); // <--- Finish hydration
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    const newSocket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });
    setSocket(newSocket);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);

    if (socket) socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, socket, loading ,haveToken}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
