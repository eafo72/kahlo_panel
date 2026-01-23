import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// home pages  & dashboard
//import Dashboard from "./pages/dashboard";
const Login = lazy(() => import("./pages/auth/login"));

const Dashboard = lazy(() => import("./pages/dashboard"));
const Calendario = lazy(() => import("./pages/calendario"));

const Usuarios = lazy(() => import("./pages/usuarios"));
const UsuariosAlta = lazy(() => import("./pages/usuarios/alta"));
const UsuariosEditar = lazy(() => import("./pages/usuarios/editar"));
const UsuariosBorrar = lazy(() => import("./pages/usuarios/borrar"));

const Guias = lazy(() => import("./pages/guias"));
const GuiasAlta = lazy(() => import("./pages/guias/alta"));
const GuiasEditar = lazy(() => import("./pages/guias/editar"));
const GuiasBorrar = lazy(() => import("./pages/guias/borrar"));

const Administradores = lazy(() => import("./pages/administradores"));
const AdministradoresAlta = lazy(() => import("./pages/administradores/alta"));
const AdministradoresEditar = lazy(() =>
  import("./pages/administradores/editar")
);
const AdministradoresBorrar = lazy(() =>
  import("./pages/administradores/borrar")
);

const Empresas = lazy(() => import("./pages/empresas"));
const EmpresasAlta = lazy(() => import("./pages/empresas/alta"));
const EmpresasEditar = lazy(() => import("./pages/empresas/editar"));
const EmpresasBorrar = lazy(() => import("./pages/empresas/borrar"));

const Categorias = lazy(() => import("./pages/categorias"));
const CategoriasAlta = lazy(() => import("./pages/categorias/alta"));
const CategoriasEditar = lazy(() => import("./pages/categorias/editar"));
const CategoriasBorrar = lazy(() => import("./pages/categorias/borrar"));

const Tours = lazy(() => import("./pages/tours"));
const ToursAlta = lazy(() => import("./pages/tours/alta"));
const ToursEditar = lazy(() => import("./pages/tours/editar"));
const ToursBorrar = lazy(() => import("./pages/tours/borrar"));
const FotosToursAlta = lazy(() => import("./pages/tours/alta_foto"));
const FotosToursBorrar = lazy(() => import("./pages/tours/borrar_foto"));
const ToursSalidas = lazy(() => import("./pages/tours/salidas"));
const ToursAltaSalida = lazy(() => import("./pages/tours/alta_salida"));
const ToursBorrarSalida = lazy(() => import("./pages/tours/borrar_salida"));
const ToursEditarSalida = lazy(() => import("./pages/tours/editar_salida"));

const ToursRutas = lazy(() => import("./pages/tours/rutas"));
const ToursAltaRuta = lazy(() => import("./pages/tours/alta_ruta"));
const ToursEditarRuta = lazy(() => import("./pages/tours/editar_ruta"));
const ToursBorrarRuta = lazy(() => import("./pages/tours/borrar_ruta"));


const Comentarios = lazy(() => import("./pages/comentarios"));
const ComentariosAlta = lazy(() => import("./pages/comentarios/alta"));
const ComentariosEditar = lazy(() => import("./pages/comentarios/editar"));
const ComentariosBorrar = lazy(() => import("./pages/comentarios/borrar"));

const Historial = lazy(() => import("./pages/historial"));

const FotografiasAlta = lazy(() => import("./pages/fotografias/alta"));

const Ventas = lazy(() => import("./pages/ventas"));

const VentasOperadores = lazy(() => import("./pages/ventasOperadores"));
const VentasOperadoresCancel = lazy(() => import("./pages/ventasOperadores/cancel"));

const ReservacionesModificar = lazy(() => import("./pages/reservaciones/modificar"));
const ReservacionesCancelar = lazy(() => import("./pages/reservaciones/cancelar"));
const ReservacionesImprimir = lazy(() => import("./pages/reservaciones/imprimir"));

const Camara = lazy(() => import("./pages/camara"));

const ColaboradoresQR = lazy(() => import("./pages/colaboradores"));

const Checkin = lazy(() => import("./pages/checkin"));

const Canceladas = lazy(() => import("./pages/canceladas"));

const NoPage = lazy(() => import("./pages/404"));
import Loading from "@/components/Loading";

import Layout from "./layout/Layout";

function App() {
  const authenticated = false;
  const publicRoutes = ['/']; // Añade aquí otras rutas públicas si las tienes
  return (
    <main className="App  relative">
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          }
        />
        <Route path="/*" element={
          <ProtectedRoute publicRoutes={publicRoutes}>
            <Layout />
          </ProtectedRoute>
        }>
          {/*<Route index element={<Dashboard />} />*/}

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendario" element={<Calendario />} />

          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/alta" element={<UsuariosAlta />} />
          <Route path="usuarios/editar" element={<UsuariosEditar />} />
          <Route path="usuarios/borrar" element={<UsuariosBorrar />} />

          <Route path="guias" element={<Guias />} />
          <Route path="guias/alta" element={<GuiasAlta />} />
          <Route path="guias/editar" element={<GuiasEditar />} />
          <Route path="guias/borrar" element={<GuiasBorrar />} />

          <Route path="administradores" element={<Administradores />} />
          <Route
            path="administradores/alta"
            element={<AdministradoresAlta />}
          />
          <Route
            path="administradores/editar"
            element={<AdministradoresEditar />}
          />
          <Route
            path="administradores/borrar"
            element={<AdministradoresBorrar />}
          />

          <Route path="empresas" element={<Empresas />} />
          <Route path="empresas/alta" element={<EmpresasAlta />} />
          <Route path="empresas/editar" element={<EmpresasEditar />} />
          <Route path="empresas/borrar" element={<EmpresasBorrar />} />

          <Route path="categorias" element={<Categorias />} />
          <Route path="categorias/alta" element={<CategoriasAlta />} />
          <Route path="categorias/editar" element={<CategoriasEditar />} />
          <Route path="categorias/borrar" element={<CategoriasBorrar />} />

          <Route path="tours" element={<Tours />} />
          <Route path="tours/alta" element={<ToursAlta />} />
          <Route path="tours/editar" element={<ToursEditar />} />
          <Route path="tours/borrar" element={<ToursBorrar />} />
          <Route path="tours/alta_foto" element={<FotosToursAlta />} />
          <Route path="tours/borrar_foto" element={<FotosToursBorrar />} />
          <Route path="tours/salidas" element={<ToursSalidas />} />
          <Route path="tours/borrar_salida" element={<ToursBorrarSalida />} />
          <Route path="tours/editar_salida" element={<ToursEditarSalida />} />
          <Route path="tours/alta_salida" element={<ToursAltaSalida />} />

          <Route path="tours/rutas" element={<ToursRutas />} />
          <Route path="tours/alta_ruta" element={<ToursAltaRuta />} />
          <Route path="tours/editar_ruta" element={<ToursEditarRuta />} />
          <Route path="tours/borrar_ruta" element={<ToursBorrarRuta />} />

          <Route path="comentarios" element={<Comentarios />} />
          <Route path="comentarios/alta" element={<ComentariosAlta />} />
          <Route path="comentarios/editar" element={<ComentariosEditar />} />
          <Route path="comentarios/borrar" element={<ComentariosBorrar />} />

          <Route path="historial" element={<Historial />} />

          <Route path="fotografias/alta" element={<FotografiasAlta />} />

          <Route path="ventas" element={<Ventas />} />

          <Route path="ventasOperadores" element={<VentasOperadores />} />
          <Route path="ventasOperadores/cancel" element={<VentasOperadoresCancel />} />

          <Route path="reservaciones/modificar" element={<ReservacionesModificar />} />
          <Route path="reservaciones/cancelar" element={<ReservacionesCancelar />} />
          <Route path="reservaciones/imprimir" element={<ReservacionesImprimir />} />
          
          <Route path="camara" element={<Camara />} />

          <Route path="colaboradores" element={<ColaboradoresQR />} />

          <Route path="checkin" element={<Checkin />} />

          <Route path="canceladas" element={<Canceladas />} />

          <Route path="*" element={<Navigate to="/404" />} />
        </Route>

        <Route
          path="/404"
          element={
            <Suspense fallback={<Loading />}>
              <NoPage />
            </Suspense>
          }
        />
      </Routes>
    </main>
  );
}

export default App;
