import { Navigate, useLocation } from 'react-router-dom';
import { hasAccess } from '../../utils/auth';
import clienteAxios from '../../configs/axios';
import { toast } from "react-toastify";
import { useState, useEffect, useCallback } from 'react';

const ProtectedRoute = ({ children, publicRoutes = [] }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isPublicRoute = publicRoutes.some(route => 
    location.pathname === route);
  const token = localStorage.getItem("token");

  const verifyToken = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      clienteAxios.defaults.headers.common['x-auth-token'] = token;
      const res = await clienteAxios.post('/usuario/verificar');
      if (res.data) {
        setUser(res.data);
      }
    } catch (error) {
      delete clienteAxios.defaults.headers.common['x-auth-token'];
      console.error(error);
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg, {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "dark",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

    
  // Si está cargando, muestra un indicador de carga
  if (loading) {
    return <div>Loading...</div>;
  }

  // Si es una ruta pública, permite el acceso
  if (isPublicRoute) {
    return children;
  }

  console.log("checking access for ", location.pathname);

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Si hay token pero no hay usuario, muestra error
  if (!user) {
    return <div>Error de autenticación. Por favor, inicia sesión nuevamente.</div>;
  }

  // Verifica acceso para rutas protegidas
    const userHasAccess = hasAccess(location.pathname, user[0]);

  if (!userHasAccess) {
    localStorage.removeItem('token')
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;