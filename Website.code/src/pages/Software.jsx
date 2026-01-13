// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Software() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Software</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Website */}
          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Personal Website</h2>
            <p className="mb-4">A responsive portfolio website created as a course project, featuring modern design and smooth navigation.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a 
              href="/Software/Personal-Website/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>

          {/* Pokemon Team Finder */}
          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Pokemon Team Finder</h2>
            <p className="mb-4">An interactive tool to help build optimal Pokemon teams with type coverage analysis.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a 
              href="/Software/Pokemon-Team-Finder/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>

          {/* Banking App */}
          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Banking App</h2>
            <p className="mb-4">A banking simulation application showcasing account management and transactions.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a 
              href="/Software/Banking/html/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>
        </div>
      </article>
    </PageWrapper>
  )
}
