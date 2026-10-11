
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { PublicProfilePage } from './pages/PublicProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { OverviewPage } from './pages/dashboard/OverviewPage'
import { ProfileEditorPage } from './pages/dashboard/ProfileEditorPage'
import { LinksPage } from './pages/dashboard/LinksPage'
import { AppearancePage } from './pages/dashboard/AppearancePage'
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'

function Protected({ children }: { children: React.ReactNode }) {
  // simple guard will be handled inside layout, but keep route
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/@:username" element={<PublicProfilePage />} />
            {/* support also /@username without encoding */}
            <Route path="/dashboard" element={<Protected><DashboardLayout /></Protected>}>
              <Route index element={<OverviewPage />} />
              <Route path="profile" element={<ProfileEditorPage />} />
              <Route path="links" element={<LinksPage />} />
              <Route path="appearance" element={<AppearancePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
