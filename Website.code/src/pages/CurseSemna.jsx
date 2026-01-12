import React, { useState } from 'react'
import PageWrapper from '../components/PageWrapper'

export default function CurseSemna() {
  const [activeTab, setActiveTab] = useState('intro')

  const tabs = {
    intro: {
      title: 'Introduction & Story Background',
      content: (
        <>
          <p className="mb-4">"Curse of Semna" is a trading card game set in a fantasy world cursed by the goddess Semna, trapped in a 500-year cycle due to her sister Terria's jealousy. Players are immortal strategists summoned to break the curse and change history.</p>
          <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/30 mt-4">
            <p className="text-indie-accent-green italic">🎮 A strategic card game where every decision shapes the fate of a cursed world!</p>
          </div>
        </>
      )
    },
    objective: {
      title: 'Game Objective & Winning',
      content: (
        <ul className="list-disc list-inside space-y-2">
          <li>Win by depleting your opponent's deck or accumulating <span className="text-indie-accent-green font-bold">35 Energy points</span>.</li>
          <li>Energy is essential for playing cards and activating effects.</li>
        </ul>
      )
    },
    components: {
      title: 'Game Components',
      content: (
        <ul className="list-disc list-inside space-y-2">
          <li>Playmat divided into zones</li>
          <li>Deck of cards (minimum 40 cards)</li>
          <li>Energy tokens/counters</li>
          <li>Life/damage counters</li>
        </ul>
      )
    }
  }

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4 font-heading">Curse of Semna</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      {/* Tabbed Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 border-b-2 border-indie-accent-green/30 pb-4">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all duration-200 cursor-pointer ${
              activeTab === tabKey
                ? 'bg-indie-accent-green text-indie-bg-main shadow-indie scale-105 border-2 border-indie-accent-green'
                : 'bg-indie-bg-main/50 border-2 border-indie-accent-green/50 text-indie-text-light hover:border-indie-accent-green hover:bg-indie-accent-green/20 hover:scale-105'
            }`}
          >
            {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <article className="text-indie-text-gray">
        <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">{tabs[activeTab].title}</h2>
        {tabs[activeTab].content}
      </article>
    </PageWrapper>
  )
}
