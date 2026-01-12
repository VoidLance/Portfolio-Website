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
                When cyberpunk meets urban fantasy, magic gets an upgrade. In a dystopian Britain where 
                resistance fighters survive through heists and cunning, Tom Elwood uncovers an ancient 
                artifact that shouldn't exist—the legendary Elwood Sword. But this discovery attracts 
                dangerous attention from across the Atlantic: elite students from the Los Angeles Witch 
                School, where CPU implants blend with spellcraft and magical artifacts are collected at 
                any cost.
              </p>
              
              <p className="mb-4 leading-relaxed">
                As Tom's underground crew—the Copper Fist—faces off against techno-mages armed with 
                both magic and advanced technology, two worlds collide in a battle that will determine 
                whether an oppressed nation can find hope in an artifact of immense power, or whether 
                that power will be locked away by those who claim to protect it.
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
