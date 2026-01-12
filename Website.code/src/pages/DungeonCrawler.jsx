// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function DungeonCrawler() {
  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Dungeon Crawler</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50 mb-6">
          <h2 className="text-2xl text-indie-accent-green mb-4 text-center font-bold">Dungeon Crawler Game</h2>
          <p className="text-center mb-4 text-indie-text-light text-lg">An interactive dungeon crawler game built with JavaScript.</p>
          <div className="text-center">
            <a 
              href="/#/games/dungeon-crawler"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-8 py-3 rounded-lg font-bold text-xl hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              Play Game →
            </a>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl text-indie-accent-pink font-bold">About</h3>
          <p>Navigate through dungeons, battle enemies, and collect treasure in this classic dungeon crawler experience.</p>
          
          <h3 className="text-xl text-indie-accent-pink font-bold mt-6">Features</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Character class system</li>
            <li>Turn-based combat</li>
            <li>Equipment and inventory management</li>
            <li>Procedurally generated dungeons</li>
          </ul>
        </div>
      </article>
    </PageWrapper>
  )
}
