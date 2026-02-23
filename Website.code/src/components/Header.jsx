import React from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'

export default function Header() {
  return (
    <header 
      className="relative w-full bg-cover bg-center bg-no-repeat border-b-2 border-indie-accent-green"
      style={{
        height: 'clamp(120px, 30vw, 192px)',
        backgroundImage: "url('/Images/header-image.jpg')"
      }}
      role="banner"
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent"
        style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(24, 24, 32, 0.393) 100%)' }}
      />
      
      {/* Navigation Bar positioned over header */}
      <nav 
        id="navbar" 
        className="bg-indie-bg-nav border-t-2 border-indie-accent-green/50"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
      >
        <Navigation />
      </nav>
    </header>
  )
}
