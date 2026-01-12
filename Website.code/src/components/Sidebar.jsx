import React from 'react'
import { updatesData } from '../data/updatesData'

export default function Sidebar() {
  const updates = updatesData

  return (
    <aside className="static lg:sticky lg:top-20 glass-sidebar w-full lg:w-[25%] lg:min-w-[320px] p-4 text-base order-2 lg:order-1 rounded-xl lg:rounded-l-xl lg:rounded-r-none mb-5 lg:mb-0 lg:mr-2 h-auto lg:max-h-[calc(100vh-7rem)] flex flex-col overflow-hidden border-2 border-indie-accent-green">
      <h2 className="text-2xl text-indie-accent-green text-center mb-4 flex-shrink-0">Updates</h2>
      <div className="w-full flex-1 glass-dark border-2 border-indie-accent-pink p-3 rounded-lg shadow-indie-sm overflow-y-auto">
        <div className="space-y-2">
          {updates.map((update, index) => (
            <div key={index} className="glass-darker border-l-2 border-indie-accent-green p-2 rounded text-xs">
              <p className="font-bold text-indie-accent-pink mb-1 text-sm">{update.date}</p>
              {update.title && <p className="text-indie-accent-green font-bold text-xs mb-1">{update.title}</p>}
              <ul className="list-disc list-inside text-indie-text-light space-y-0.5 ml-0.5">
                {update.items.map((item, idx) => (
                  <li key={idx} className="text-xs leading-tight">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
