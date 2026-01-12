import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function Navigation() {
  const [openDropdown, setOpenDropdown] = useState(null)

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  return (
    <ul className="flex flex-row gap-6 items-center justify-center relative p-4 bg-indie-bg-nav">
      <li className="menu-item group relative">
        <NavLink to="/" onClick={closeDropdown}>Home</NavLink>
      </li>
      <li className="menu-item group relative">
        <NavLink to="/helpdesk" onClick={closeDropdown}>HelpDesk</NavLink>
      </li>
      <li className="menu-item group relative">
        <NavLink to="/3d-models" onClick={closeDropdown}>3D Models</NavLink>
      </li>
      <li 
        className="menu-item group relative"
        onMouseEnter={() => setOpenDropdown('games')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button className="cursor-pointer text-indie-text-light">Games ᐁ</button>
        <ul className={`dropdown ${openDropdown === 'games' ? 'opacity-100 visible' : ''}`}>
          <li className="dropdown-item">
            <NavLink to="/games" onClick={closeDropdown}>Games List</NavLink>
          </li>
          <li className="dropdown-item">
            <NavLink to="/games/curse-semna" onClick={closeDropdown}>Curse of Semna</NavLink>
          </li>
          <li className="dropdown-item">
            <NavLink to="/games/dungeon-crawler" onClick={closeDropdown}>Dungeon Crawler</NavLink>
          </li>
        </ul>
      </li>
      <li 
        className="menu-item group relative"
        onMouseEnter={() => setOpenDropdown('books')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button className="cursor-pointer text-indie-text-light">Books ᐁ</button>
        <ul className={`dropdown ${openDropdown === 'books' ? 'opacity-100 visible' : ''}`}>
          <li className="dropdown-item">
            <NavLink to="/books" onClick={closeDropdown}>Books</NavLink>
          </li>
          <li className="dropdown-item">
            <a href="#" onClick={closeDropdown}>Example</a>
          </li>
        </ul>
      </li>
      <li className="menu-item group relative">
        <NavLink to="/blog" onClick={closeDropdown}>Blog</NavLink>
      </li>
      <li 
        className="menu-item group relative"
        onMouseEnter={() => setOpenDropdown('software')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button className="cursor-pointer text-indie-text-light">Software ᐁ</button>
        <ul className={`dropdown ${openDropdown === 'software' ? 'opacity-100 visible' : ''}`}>
          <li className="dropdown-item">
            <NavLink to="/software" onClick={closeDropdown}>Software</NavLink>
          </li>
          <li className="dropdown-item">
            <a href="/Software/Personal-Website/index.html" target="_blank" rel="noopener noreferrer" onClick={closeDropdown}>Personal Website</a>
          </li>
          <li className="dropdown-item">
            <a href="/Software/Pokemon-Team-Finder/index.html" target="_blank" rel="noopener noreferrer" onClick={closeDropdown}>Pokemon Team Finder</a>
          </li>
        </ul>
      </li>
    </ul>
  )
}
