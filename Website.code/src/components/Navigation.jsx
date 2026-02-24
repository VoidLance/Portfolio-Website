// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navigation() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }

  return (
    <>
      {/* Mobile hamburger button - sticks to top with full header height and background */}
      <div 
        className="md:hidden w-full flex justify-end items-start p-3 fixed top-0 left-0 right-0 z-50 bg-cover bg-center border-b-2 border-indie-accent-green"
        style={{
          height: 'clamp(120px, 30vw, 192px)',
          backgroundImage: "url('/Images/header-image.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Gradient overlay matching header */}
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(24, 24, 32, 0.393) 100%)' }}
        />
        <button
          className="text-indie-accent-green text-2xl focus:outline-none transition-colors hover:text-[#1cdba2] relative z-10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Navigation menu - hidden on mobile until hamburger is clicked */}
      <ul 
        className={`flex flex-col md:flex-row gap-3 md:gap-6 items-stretch md:items-center justify-start md:justify-center max-md:fixed max-md:left-0 max-md:right-0 max-md:z-40 max-md:overflow-y-auto p-3 md:p-4 md:bg-indie-bg-nav md:relative mobile-menu ${
          !mobileMenuOpen ? 'max-md:hidden' : ''
        }`}
      >
      <li className="menu-item group relative w-full md:w-auto">
        <NavLink to="/" onClick={closeMobileMenu} className="block md:inline text-base md:text-base">Home</NavLink>
      </li>
      <li className="menu-item group relative w-full md:w-auto">
        <NavLink to="/helpdesk" onClick={closeMobileMenu} className="block md:inline text-base md:text-base">HelpDesk</NavLink>
      </li>
      <li className="menu-item group relative w-full md:w-auto">
        <NavLink to="/3d-models" onClick={closeMobileMenu} className="block md:inline text-base md:text-base">3D Models</NavLink>
      </li>
      <li 
        className="menu-item group relative w-full md:w-auto"
        onMouseEnter={() => setOpenDropdown('games')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button 
          className="cursor-pointer text-indie-text-light w-full md:w-auto flex justify-between items-center md:justify-start gap-2 text-base md:text-base"
          onClick={() => toggleDropdown('games')}
        >
          Games <span className="md:hidden">{openDropdown === 'games' ? '▼' : '▶'}</span><span className="hidden md:inline">ᐁ</span>
        </button>
        <ul className={`dropdown w-full md:w-auto md:relative md:top-0 md:left-0 ${openDropdown === 'games' ? 'opacity-100 visible block md:absolute md:top-full md:left-0' : 'hidden md:opacity-0 md:invisible md:absolute'}`}>
          <li className="dropdown-item">
            <NavLink to="/games" onClick={closeMobileMenu} className="block text-base">Games List</NavLink>
          </li>
          <li className="dropdown-item">
            <NavLink to="/games/curse-semna" onClick={closeMobileMenu} className="block text-base">Curse of Semna</NavLink>
          </li>
          <li className="dropdown-item">
            <NavLink to="/games/dungeon-crawler" onClick={closeMobileMenu} className="block text-base">Dungeon Crawler</NavLink>
          </li>
        </ul>
      </li>
      <li 
        className="menu-item group relative w-full md:w-auto"
        onMouseEnter={() => setOpenDropdown('books')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button 
          className="cursor-pointer text-indie-text-light w-full md:w-auto flex justify-between items-center md:justify-start gap-2 text-base md:text-base"
          onClick={() => toggleDropdown('books')}
        >
          Books <span className="md:hidden">{openDropdown === 'books' ? '▼' : '▶'}</span><span className="hidden md:inline">ᐁ</span>
        </button>
        <ul className={`dropdown w-full md:w-auto md:relative md:top-0 md:left-0 ${openDropdown === 'books' ? 'opacity-100 visible block md:absolute md:top-full md:left-0' : 'hidden md:opacity-0 md:invisible md:absolute'}`}>
          <li className="dropdown-item">
            <NavLink to="/books" onClick={closeMobileMenu} className="block text-base">Books</NavLink>
          </li>
          <li className="dropdown-item">
            <NavLink to="/books/laws" onClick={closeMobileMenu} className="block text-base">L.A.W.S</NavLink>
          </li>
        </ul>
      </li>
      <li className="menu-item group relative w-full md:w-auto">
        <NavLink to="/blog" onClick={closeMobileMenu} className="block md:inline text-base md:text-base">Blog</NavLink>
      </li>
      <li 
        className="menu-item group relative w-full md:w-auto"
        onMouseEnter={() => setOpenDropdown('software')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button 
          className="cursor-pointer text-indie-text-light w-full md:w-auto flex justify-between items-center md:justify-start gap-2 text-base md:text-base"
          onClick={() => toggleDropdown('software')}
        >
          Software <span className="md:hidden">{openDropdown === 'software' ? '▼' : '▶'}</span><span className="hidden md:inline">ᐁ</span>
        </button>
        <ul className={`dropdown w-full md:w-auto md:relative md:top-0 md:left-0 ${openDropdown === 'software' ? 'opacity-100 visible block md:absolute md:top-full md:left-0' : 'hidden md:opacity-0 md:invisible md:absolute'}`}>
          <li className="dropdown-item">
            <NavLink to="/software" onClick={closeMobileMenu} className="block text-base">Software</NavLink>
          </li>
          <li className="dropdown-item">
            <a href="/Software/Movie-Review-App/index.html" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className="block text-base">Movie Review App</a>
          </li>
          <li className="dropdown-item">
            <a href="/Software/Personal-Website/index.html" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className="block text-base">Personal Website</a>
          </li>
          <li className="dropdown-item">
            <a href="/Software/Pokemon-Team-Finder/index.html" target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu} className="block text-base">Pokemon Team Finder</a>
          </li>
        </ul>
      </li>
    </ul>
    </>
  )
}
