// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import lawsCover from '../../Images/laws-cover.jpg'

export default function Books() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Books</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* L.A.W.S Book Entry */}
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-indie-bg-nav rounded-lg border border-indie-accent-green/30 hover:border-indie-accent-green/60 transition-colors">
            <div className="md:w-1/4 flex-shrink-0">
              <Link to="/books/laws">
                <img 
                  src={lawsCover} 
                  alt="L.A.W.S Book Cover"
                  className="w-full rounded-lg shadow-lg border-2 border-indie-accent-green/30 hover:border-indie-accent-green transition-colors cursor-pointer"
                />
              </Link>
            </div>
            
            <div className="md:w-3/4">
              <Link to="/books/laws" className="hover:text-indie-accent-green transition-colors">
                <h2 className="text-3xl text-indie-accent-green mb-2">
                  L.A.W.S
                </h2>
                <p className="text-xl text-indie-text-gray/80 mb-4 italic">
                  Los Angeles Witch School
                </p>
              </Link>
              
              <p className="mb-4 leading-relaxed">
                In a fallen Britain where an underground resistance survives through wit, skill, and crime,
                Tom Elwood leads the Copper Fist—a crew of specialists united against an oppressive government.
                After narrowly escaping the country's highest security prison, Tom returns to Sheffield to rebuild
                his crew and support his family. It should be another routine job at the local scrapyard.
              </p>
              
              <p className="mb-4 leading-relaxed">
                Then Tom uncovers something that doesn't belong there. Something elaborate. Something that shouldn't exist.
                And the moment he touches it, he triggers a countdown. Mysterious figures from across the Atlantic have
                been searching for it for longer than he knows, and they're closing in. What Tom doesn't understand is that
                the real danger isn't the artifact itself—it's what his discovery will reveal about the world he thought
                he knew.
              </p>
              
              <Link 
                to="/books/laws"
                className="inline-block px-6 py-2 bg-indie-accent-green text-indie-bg rounded hover:bg-indie-accent-green/80 transition-colors font-semibold"
              >
                Read More →
              </Link>
              
              <p className="mt-4 text-sm text-indie-text-gray/70 italic">
                Status: Work in Progress
              </p>
            </div>
          </div>
        </div>
      </article>
    </PageWrapper>
  )
}
