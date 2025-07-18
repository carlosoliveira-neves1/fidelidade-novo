import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (token && usuarioSalvo) {
      try {
        const usuarioData = JSON.parse(usuarioSalvo);
        setUsuario(usuarioData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (usuarioData) => {
    setUsuario(usuarioData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  const isAuthenticated = () => {
    return !!usuario && !!localStorage.getItem('token');
  };

  const isAdmin = () => {
    return usuario && usuario.tipo === 'Administrador';
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    usuario,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    getToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

