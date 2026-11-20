import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ToastProvider } from './components/Toast'
import { Login } from './pages/Login'

// Cada pantalla se descarga cuando se abre: el login ya no espera a bajar el panel, las gráficas
// (Recharts) ni el chat. Antes todo iba en un solo archivo de JavaScript de casi 900 KB.
const Chat = lazy(() => import('./pages/Chat').then((m) => ({ default: m.Chat })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const DetalleEstudiante = lazy(() =>
  import('./pages/DetalleEstudiante').then((m) => ({ default: m.DetalleEstudiante })),
)
const Historial = lazy(() => import('./pages/Historial').then((m) => ({ default: m.Historial })))
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })))
const Reportes = lazy(() => import('./pages/Reportes').then((m) => ({ default: m.Reportes })))

/** Mientras baja el código de una pantalla, el resto de la interfaz (menú, encabezado) sigue visible. */
function Pantalla({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <p className="cargando-pantalla" role="status">
          Cargando…
        </p>
      }
    >
      {children}
    </Suspense>
  )
}

/** El panel institucional no aplica al estudiante: su entrada es Estadísticas. */
function Inicio() {
  const { sesion } = useAuth()
  if (sesion?.rol === 'ESTUDIANTE') return <Navigate to="/reportes" replace />
  return (
    <Pantalla>
      <Dashboard />
    </Pantalla>
  )
}

/** Fichas y panel solo para los roles institucionales. */
function SoloInstitucional({ children }: { children: ReactNode }) {
  const { sesion } = useAuth()
  if (sesion?.rol === 'ESTUDIANTE') return <Navigate to="/reportes" replace />
  return children
}

/** El historial personal es exclusivo del rol Estudiante. */
function SoloEstudiante({ children }: { children: ReactNode }) {
  const { sesion } = useAuth()
  if (sesion?.rol !== 'ESTUDIANTE') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Pantalla><Register /></Pantalla>} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Inicio />} />
                <Route
                  path="estudiantes/:id"
                  element={
                    <SoloInstitucional>
                      <Pantalla>
                        <DetalleEstudiante />
                      </Pantalla>
                    </SoloInstitucional>
                  }
                />
                <Route path="reportes" element={<Pantalla><Reportes /></Pantalla>} />
                <Route path="chat" element={<Pantalla><Chat /></Pantalla>} />
                <Route path="chat/:id" element={<Pantalla><Chat /></Pantalla>} />
                <Route
                  path="historial"
                  element={
                    <SoloEstudiante>
                      <Pantalla>
                        <Historial />
                      </Pantalla>
                    </SoloEstudiante>
                  }
                />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
