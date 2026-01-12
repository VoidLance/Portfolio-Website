// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'
import { updatesData } from '../data/updatesData'

export default function Updates() {
  const updates = updatesData

  return (
    <PageWrapper mainClassName="w-full" hasSidebar={false}>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Updates & Changelog</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="space-y-4">
          {updates.map((update, index) => (
            <div key={index} className="bg-indie-bg-sidebar border-l-4 border-indie-accent-green p-4 rounded-r-lg shadow-indie-sm">
              <h3 className="text-indie-accent-pink font-bold text-lg mb-2">
                <i className="fas fa-calendar-day"></i> {update.date}
              </h3>
              {update.title && <h4 className="text-indie-accent-green font-bold mb-2">{update.title}</h4>}
              <ul className="list-disc list-inside space-y-1 ml-4">
                {update.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </article>
    </PageWrapper>
  )
}
