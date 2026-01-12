import React, { useState } from 'react'

export default function Sidebar() {
  const [iframeHeight, setIframeHeight] = useState('600px')

  return (
    <aside className="static lg:sticky lg:top-20 bg-indie-bg-sidebar w-full lg:w-[18%] lg:min-w-[280px] p-4 text-base order-2 lg:order-1 rounded-xl lg:rounded-l-xl lg:rounded-r-none mb-5 lg:mb-0 lg:mr-5 h-auto lg:max-h-[calc(100vh-7rem)] flex flex-col overflow-y-auto">
      <h2 className="text-2xl text-indie-accent-green text-center mb-4 flex-shrink-0">Updates</h2>
      <div className="w-full flex-1 min-h-[600px] lg:min-h-[500px] bg-indie-bg-nav border-2 border-indie-accent-pink p-2.5 rounded-lg shadow-indie-sm">
        {/* Updates content will be loaded here */}
        <div className="text-indie-text-gray text-sm">
          <h3 className="text-indie-accent-green mb-3">Latest Updates</h3>
          <ul className="space-y-2">
            <li className="border-b border-indie-accent-pink/30 pb-2">
              <p className="font-bold text-indie-accent-pink">January 12, 2026</p>
              <p>Website migrated to React for better performance</p>
            </li>
            <li className="border-b border-indie-accent-pink/30 pb-2">
              <p className="font-bold text-indie-accent-pink">December 2025</p>
              <p>Portfolio website launched</p>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
