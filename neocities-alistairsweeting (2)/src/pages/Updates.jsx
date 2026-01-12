import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Updates() {
  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Updates & Changelog</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="space-y-6">
          <div className="border-l-4 border-indie-accent-pink pl-4">
            <h3 className="text-indie-accent-pink font-bold mb-2">January 12, 2026</h3>
            <p>Website refactored to React for improved performance and user experience. No more full page reloads!</p>
          </div>
          
          <div className="border-l-4 border-indie-accent-pink pl-4">
            <h3 className="text-indie-accent-pink font-bold mb-2">December 2025</h3>
            <p>Portfolio website launched with custom Tailwind CSS styling and indie aesthetic.</p>
          </div>
        </div>
      </article>
    </PageWrapper>
  )
}
