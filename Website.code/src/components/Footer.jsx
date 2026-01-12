import React from 'react'

export default function Footer() {
  return (
    <footer 
      className="bg-indie-bg-nav w-full p-5 text-center mt-5 rounded-xl border-t-2 border-indie-accent-green"
      role="contentinfo"
    >
      <p className="text-indie-text-gray text-sm mb-2">CC0 Public Domain, 2022</p>
      <p className="text-indie-text-gray text-sm mb-3">
        Any content such as stories, games and art contained on any page of this website is copyrighted individually, 
        the CC0 license applies only to the website itself.
      </p>
      
      <nav aria-label="Social media links" className="mt-3">
        <div className="flex justify-center gap-4 text-2xl">
          <a 
            href="https://bsky.app/profile/alistairsweeting.online" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indie-text-gray hover:text-[#d834c2] hover:shadow-indie-glow transition-all" 
            aria-label="BlueSky profile" 
            title="Check out my BlueSky profile!"
          >
            <i className="fa-brands fa-bluesky"></i>
          </a>
          <a 
            href="https://www.linkedin.com/in/alistair-sweeting-959453165/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indie-text-gray hover:text-[#d834c2] hover:shadow-indie-glow transition-all" 
            aria-label="LinkedIn profile" 
            title="Check out my LinkedIn profile!"
          >
            <i className="fa-brands fa-linkedin"></i>
          </a>
          <a 
            href="https://www.threads.com/@alistairsweeting" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indie-text-gray hover:text-[#d834c2] hover:shadow-indie-glow transition-all" 
            aria-label="Threads profile" 
            title="Check out my Threads profile!"
          >
            <i className="fa-brands fa-threads"></i>
          </a>
          <a 
            href="https://www.instagram.com/alistairsweeting/?hl=en" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-indie-text-gray hover:text-[#d834c2] hover:shadow-indie-glow transition-all" 
            aria-label="Instagram profile" 
            title="Check out my Instagram profile!"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div>
      </nav>
    </footer>
  )
}
