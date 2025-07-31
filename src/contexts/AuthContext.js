import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Authentication Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cargo, setCargo] = useState("");
  
  useEffect(() => {
    // Check if user is already logged in from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        // Validar estructura del usuario
        if (parsedUser && parsedUser.id && parsedUser.username) {
          setUser(parsedUser);
          setIsAdmin(parsedUser.isAdmin || false);
        } else {
          // Si los datos son inválidos, limpiar localStorage
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);
    // Login function - would typically call an API
  const login = (userData) => {
    // Validar datos de entrada
    if (!userData || !userData.username) {
      throw new Error('Datos de usuario inválidos');
    }

    const enrichedUserData = {
      id: userData.id || Date.now(),
      username: userData.username,
      name: userData.name || userData.username, // Fallback to username if name is not provided
      isAdmin: userData.isAdmin || false,
      cargo: userData.cargo || '',
      loginTime: new Date().toISOString(),
      roles: userData.roles || (userData.isAdmin ? ['admin'] : ['user'])
    };

    setUser(enrichedUserData);
    setIsAdmin(enrichedUserData.isAdmin || false);
    localStorage.setItem('user', JSON.stringify(enrichedUserData));
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    
    // Opcional: limpiar otros datos de sesión
    sessionStorage.clear();
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!user.id;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    const userRoles = user.roles || [];
    return userRoles.includes(role) || (role === 'admin' && isAdmin);
  };

  // Check if session is still valid (opcional, para implementar expiración)
  const isSessionValid = () => {
    if (!user || !user.loginTime) return false;
    
    const loginTime = new Date(user.loginTime);
    const now = new Date();
    const sessionDuration = 8 * 60 * 60 * 1000; // 8 horas
    
    return (now.getTime() - loginTime.getTime()) < sessionDuration;
  };
    return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading,
      login, 
      logout, 
      isAuthenticated,
      hasRole,
      isSessionValid,
      cargo: user?.cargo || '',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
