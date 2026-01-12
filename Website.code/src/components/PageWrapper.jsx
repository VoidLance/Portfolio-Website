import React from 'react'
import Sidebar from './Sidebar'

export default function PageWrapper({ children, mainClassName = 'w-full lg:w-[78%]', hasSidebar = true }) {
  return (
    <div className="w-full max-w-[95%] mx-auto px-2 lg:px-4" style={{ marginTop: '2rem' }}>
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
        <main 
          className={`${mainClassName} glass-effect p-5 rounded-xl mb-5 shadow-indie border-2 border-indie-accent-green min-w-0 ${hasSidebar ? 'order-1 lg:order-2' : ''}`}
          role="main"
        >
          {children}
        </main>
        {hasSidebar && <Sidebar />}
      </div>
    </div>
  )
}
