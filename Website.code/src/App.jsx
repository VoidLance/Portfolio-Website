// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
// Alistair Sweeting's Personal Portfolio Website
import React, { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
// Personal portfolio website app
import Home from './pages/Home'
import Games from './pages/Games'
import Blog from './pages/Blog'
import Books from './pages/Books'
import Helpdesk from './pages/Helpdesk'
import HelpdeskAdmin from './pages/HelpdeskAdmin'
import ThreeDModels from './pages/3DModels'
import Software from './pages/Software'
import CurseSemna from './pages/CurseSemna'
import DungeonCrawler from './pages/DungeonCrawler'
import LAWSBook from './pages/LAWSBook'
import NotFound from './pages/NotFound'

export default function App() {
  // Update gradient angle on scroll
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight
      const scrollPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0
      const clampedPercent = Math.max(0, Math.min(1, scrollPercent))
      const angle = 120 + clampedPercent * 120
      document.documentElement.style.setProperty('--gradient-angle', angle + 'deg')
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/laws" element={<LAWSBook />} />
            <Route path="/helpdesk" element={<Helpdesk />} />
            <Route path="/helpdesk/admin" element={<HelpdeskAdmin />} />
            <Route path="/3d-models" element={<ThreeDModels />} />
            <Route path="/software" element={<Software />} />
            <Route path="/games/curse-semna" element={<CurseSemna />} />
            <Route path="/games/dungeon-crawler" element={<DungeonCrawler />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}
