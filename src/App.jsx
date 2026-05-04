import { HashRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Slideshow from './pages/Slideshow'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/slideshow" element={<Slideshow />} />
      </Routes>
    </HashRouter>
  )
}
