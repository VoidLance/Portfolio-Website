import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function NotFound() {
  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">404 - Page Not Found</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray text-center">
        <p className="text-2xl mb-4">Oops! The page you're looking for doesn't exist.</p>
        <p>
          <a href="/" className="text-indie-accent-green font-bold hover:text-[#1cdba2] transition-all">
            Return to Home
          </a>
        </p>
      </article>
    </PageWrapper>
  )
}
