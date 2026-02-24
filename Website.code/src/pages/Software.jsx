// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useState, useEffect } from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Software() {
  const [courseProjects, setCourseProjects] = useState([])
  const [showCourseProjects, setShowCourseProjects] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (showCourseProjects && courseProjects.length === 0) {
      fetchCourseProjects()
    }
  }, [showCourseProjects])

  const fetchCourseProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch JavaScript folder
      const jsResponse = await fetch('https://api.github.com/repos/VoidLance/Course-Files/contents/JavaScript')
      const jsData = await jsResponse.json()
      
      // Fetch React subfolder
      const reactResponse = await fetch('https://api.github.com/repos/VoidLance/Course-Files/contents/JavaScript/React')
      const reactData = await reactResponse.json()
      
      // Filter for directories only
      const jsFolders = jsData.filter(item => item.type === 'dir' && item.name !== 'React')
      const reactFolders = reactData.filter(item => item.type === 'dir')
      
      // Combine and format
      const allProjects = [
        ...jsFolders.map(folder => ({
          name: folder.name,
          url: folder.html_url,
          category: 'JavaScript'
        })),
        ...reactFolders.map(folder => ({
          name: folder.name,
          url: folder.html_url,
          category: 'React'
        }))
      ]
      
      setCourseProjects(allProjects)
    } catch (err) {
      setError('Failed to load course projects from GitHub')
      console.error('GitHub API error:', err)
    } finally {
      setLoading(false)
    }
  }
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Software</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Movie Review App */}
          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Movie Review App</h2>
            <p className="mb-4">A full-featured movie review application built with Next.js, featuring TMDB API integration, search functionality, dark mode, and advanced filtering.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a 
              href="/Software/Movie-Review-App/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>

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

        {/* Course Projects Section - De-emphasized */}
        <div className="mt-12 pt-8 border-t border-indie-accent-green/20">
          <button
            onClick={() => setShowCourseProjects(!showCourseProjects)}
            className="text-sm text-indie-text-gray/60 hover:text-indie-text-gray transition-colors flex items-center gap-2 mb-4"
          >
            <span>{showCourseProjects ? '▼' : '▶'}</span>
            <span>Additional Course Projects from GitHub</span>
            <span className="text-xs opacity-50">(JavaScript & React exercises)</span>
          </button>

          {showCourseProjects && (
            <div className="mt-4">
              {loading && (
                <p className="text-sm text-indie-text-gray/50 italic">Loading projects from GitHub...</p>
              )}
              
              {error && (
                <p className="text-sm text-red-400/70">{error}</p>
              )}
              
              {!loading && !error && courseProjects.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {courseProjects.map((project, index) => (
                    <a
                      key={index}
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-darker p-3 rounded border border-indie-accent-green/20 hover:border-indie-accent-green/40 transition-colors group"
                    >
                      <div className="text-xs text-indie-accent-green/50 mb-1">{project.category}</div>
                      <div className="text-sm text-indie-text-gray/80 group-hover:text-indie-text-light transition-colors break-words">
                        {project.name}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </PageWrapper>
  )
}
