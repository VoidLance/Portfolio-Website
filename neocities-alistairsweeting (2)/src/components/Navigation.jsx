import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navigation() {
  const [openDropdown, setOpenDropdown] = useState(null)

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
  }

  return (
    <ul className="flex flex-row gap-6 items-center relative p-4">
      <li className="menu-item group relative">
        <Link to="/" onClick={closeDropdown}>Home</Link>
      </li>
      <li className="menu-item group relative">
        <Link to="/helpdesk" onClick={closeDropdown}>HelpDesk</Link>
      </li>
      <li className="menu-item group relative">
        <Link to="/3d-models" onClick={closeDropdown}>3D Models</Link>
      </li>
      <li 
        className="menu-item group relative"
        onMouseEnter={() => setOpenDropdown('games')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button className="cursor-pointer">Games ᐁ</button>
        <ul className={`dropdown ${openDropdown === 'games' ? 'opacity-100 visible' : ''}`}>
          <li className="dropdown-item">
            <Link to="/games" onClick={closeDropdown}>Games List</Link>
          </li>
          <li className="dropdown-item">
            <a href="/Games/CurseSemna.html" onClick={closeDropdown}>Curse of Semna</a>
          </li>
          <li className="dropdown-item">
            <a href="/Games/DungeonCrawler/index.html" onClick={closeDropdown}>Dungeon Crawler</a>
          </li>
        </ul>
      </li>
      <li 
        className="menu-item group relative"
        onMouseEnter={() => setOpenDropdown('books')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button className="cursor-pointer">Books ᐁ</button>
        <ul className={`dropdown ${openDropdown === 'books' ? 'opacity-100 visible' : ''}`}>
          <li className="dropdown-item">
            <Link to="/books" onClick={closeDropdown}>Books</Link>
          </li>
          <li className="dropdown-item">
            <a href="#" onClick={closeDropdown}>Example</a>
          </li>
        </ul>
      </li>
      <li className="menu-item group relative">
        <Link to="/blog" onClick={closeDropdown}>Blog</Link>
      </li>
      <li 
        className="menu-item group relative"
        onMouseEnter={() => setOpenDropdown('software')}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button className="cursor-pointer">Software ᐁ</button>
        <ul className={`dropdown ${openDropdown === 'software' ? 'opacity-100 visible' : ''}`}>
          <li className="dropdown-item">
            <Link to="/software" onClick={closeDropdown}>Software</Link>
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
