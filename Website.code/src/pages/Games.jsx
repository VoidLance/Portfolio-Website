// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Games() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Games</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Curse of Semna */}
          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Curse of Semna</h2>
            <p className="mb-4">A strategic trading card game set in a fantasy world cursed by the goddess Semna. Players are immortal strategists summoned to break the curse and change history.</p>
            <a 
              href="/Games/CurseSemna.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              Play Game →
            </a>
          </div>

          {/* Dungeon Crawler */}
          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Dungeon Crawler</h2>
            <p className="mb-4">An interactive dungeon crawler game built with JavaScript. Navigate through dungeons, battle enemies, and collect treasure in this classic adventure.</p>
            <a 
              href="/Games/DungeonCrawler/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              Play Game →
            </a>
          </div>
        </div>
      </article>
    </PageWrapper>
  )
}
