import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Games() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Games</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <p>Coming soon! Check out my game projects in development.</p>
      </article>
    </PageWrapper>
  )
}
