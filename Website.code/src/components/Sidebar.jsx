import React from 'react'

export default function Sidebar() {
  const updates = [
    {
      date: '12/01/26',
      title: 'Updates Layout Improvements',
      items: [
        'Increased sidebar width to 25%',
        'Reduced gap between sections',
        'Better use of horizontal space'
      ]
    },
    {
      date: '12/01/26',
      title: 'React Deployment & Automation',
      items: [
        'Deployed React site to Neocities with HashRouter',
        'Automated build & deploy with git hooks',
        'Fixed deployment MIME type issues',
        'Instant navigation with zero page reloads'
      ]
    },
    {
      date: '12/01/26',
      title: 'Dungeon Crawler Polish',
      items: [
        'Fixed spell choice UI visibility',
        'Implemented spell replacement menu',
        'Eliminated shadow artifacts',
        'Cleaned up deprecated files'
      ]
    },
    {
      date: '12/01/26',
      title: 'React Refactor Complete',
      items: [
        'Refactored website to React',
        'Migrated to Vite + Tailwind CSS v4',
        'Component-based architecture',
        'All styling preserved'
      ]
    },
    {
      date: '19/11/25',
      items: [
        'Upgraded Curse of Semna with modern Tailwind styling',
        'Integrated header image with navbar overlay',
        'Added visual current page markers',
        'Fixed WebDAV filesystem issues'
      ]
    },
    {
      date: '07/09/25',
      items: [
        'Changed background with animated gradient',
        'Added scroll effect to gradient',
        'Updated header image',
        'Corrected HTML issues'
      ]
    },
    {
      date: '06/09/25',
      items: [
        'Added social media links',
        'Updated footer styling',
        'Moved footer to inline HTML'
      ]
    },
    {
      date: '03/09/25',
      items: [
        'Added Bluesky link',
        'Made footer a separate HTML file',
        'Changed fonts and styling'
      ]
    },
    {
      date: '01/09/25',
      items: [
        'Made further adjustments to the gallery layout for better responsiveness'
      ]
    },
    {
      date: '31/08/25',
      items: [
        'Finally fixed the issue with the gallery page not updating by renaming the file paths',
        'Spent way too long messing around with an AI built site only to realise I can build it better',
        'Also spent way too long trying to get the gallery page on the Personal Site working'
      ]
    },
    {
      date: '30/08/25',
      items: [
        'Added some box shadows and rounded corners to the main content and sidebar',
        'Added a border around the main content area to make it stand out more',
        'Added a box shadow to the header area to give it some depth'
      ]
    },
    {
      date: '29/08/25',
      items: [
        'Changed a bunch of CSS to make the site scroll better with a fixed header and a better looking navbar',
        'Changed the updates section to appear on the very far left on larger screens, but underneath the main content on smaller screens'
      ]
    },
    {
      date: '27/08/25',
      items: [
        'Updated CSS to comply with standards expected on software dev course',
        'Updated all links on homepage to open in new tab',
        'Added horizontal bars for visual separation',
        'Removed the "Hi There!" bit that had become weirdly placed',
        'Updated the copyright licensing message'
      ]
    },
    {
      date: '21/08/25',
      items: [
        'Posthumously added completed tasks to this list',
        'Added a page to games/CurseofSemna so that it no longer links to a non-existent page',
        'Added photography portfolio links to home page',
        'Updated the blog'
      ]
    },
    {
      date: 'Unknown',
      items: [
        'Deleted test page',
        'Added helpdesk and 3D Models pages',
        'Added submenu functionality to the Games link'
      ]
    },
    {
      date: 'Beginning',
      items: [
        'Used sadgrl\'s layout tool',
        'Wrote beginning content',
        'Added test page to ensure links are working',
        'Linked to gemini page for gemini browser users'
      ]
    },
  ]

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
