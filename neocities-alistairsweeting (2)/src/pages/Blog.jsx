import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Blog() {
  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Blog</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <p>Blog posts coming soon!</p>
      </article>
    </PageWrapper>
  )
}
