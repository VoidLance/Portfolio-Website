// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

const FEATURED_SOFTWARE_REPOS = [
  {
    label: 'Portfolio Website',
    href: 'https://github.com/VoidLance/Portfolio-Website',
    description: 'React and deployment workflow',
  },
  {
    label: 'React Helpdesk',
    href: 'https://github.com/VoidLance/course-files-javascript-react-helpdesk',
    description: 'React and TypeScript',
  },
  {
    label: 'PHP Task Management',
    href: 'https://github.com/VoidLance/course-files-php-taskmanagementsystem',
    description: 'PHP backend work',
  },
  {
    label: 'Python Library Inventory',
    href: 'https://github.com/VoidLance/course-files-python-library-inventory-management',
    description: 'Python application logic',
  },
  {
    label: 'SQL Final Projects',
    href: 'https://github.com/VoidLance/course-files-sql-final-projects',
    description: 'SQL and database design',
  },
  {
    label: 'JavaScript React Movie Review',
    href: 'https://github.com/VoidLance/course-files-javascript-react-movie-review-app',
    description: 'React UI and API work',
  },
]

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
        className={`flex flex-col md:flex-row gap-3 md:gap-6 items-stretch md:items-center justify-start md:justify-center max-md:fixed max-md:left-0 max-md:right-0 max-md:z-40 max-md:overflow-y-auto p-3 md:p-4 md:bg-indie-bg-nav md:relative mobile-menu ${!mobileMenuOpen ? 'max-md:hidden' : ''
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
              <NavLink to="/games/curse-semna" onClick={closeMobileMenu} className="block text-base">Semna: Shattered Cycles</NavLink>
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
            <li className="dropdown-item px-4 py-2">
              <div className="text-[11px] uppercase tracking-[0.2em] text-indie-accent-green/60 mb-2">Featured GitHub Projects</div>
              <ul className="space-y-1">
                {FEATURED_SOFTWARE_REPOS.map(repo => (
                  <li key={repo.href} className="rounded-md hover:bg-white/5 transition-colors">
                    <a
                      href={repo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                      className="block px-2 py-2 text-sm text-indie-text-light"
                    >
                      <span className="block font-medium">{repo.label}</span>
                      <span className="block text-xs text-indie-text-gray/60">{repo.description}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </>
  )
}
