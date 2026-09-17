import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Vision from './pages/Vision'
import Checkout from './pages/Checkout'
import MissionnaireOnboarding from './pages/MissionnaireOnboarding'
import MissionnaireDashboard from './pages/MissionnaireDashboard'
import Admin from './pages/Admin'
import Architecture from './pages/Architecture'
import Login from './pages/Login'
import Nav from './components/Nav'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen grain flex flex-col">
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/missionnaire/onboarding" element={<MissionnaireOnboarding />} />
          <Route path="/missionnaire/dashboard" element={<MissionnaireDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
