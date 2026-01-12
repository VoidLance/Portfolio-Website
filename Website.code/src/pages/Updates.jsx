// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Updates() {
  const updates = [
    {
      date: '12/01/26',
      title: 'AI Agent Instructions & Tab Title Improvements',
      items: [
        'Added AI_AGENT_GUIDE.md instructions comment to all page files to guide future AI agents',
        'Updated Curse of Semna tab titles to be shorter and more meaningful when truncated by button size (now testing updates)'
      ]
    },
    {
      date: '12/01/26',
      title: 'Curse of Semna Game Rules Expansion',
      items: [
        'Integrated comprehensive game information from design document into Curse of Semna page',
        'Added 10 new tabbed sections: Story, How to Win, Game Setup, Turn Structure, Combat & Attacking, Energy System, Card Types & Roles, Deckbuilding Rules, Playmat Zones, and Game Glossary',
        'Included full gameplay mechanics, core rules, and terminology definitions',
        'Removed all planning/design notes to keep only practical game information for players'
      ]
    },
    {
      date: '12/01/26',
      title: 'Updates Section Layout Improvements',
      items: [
        'Increased updates sidebar width from 18% to 25% for better readability',
        'Reduced gap between updates sidebar and main content from 20px to 8px',
        'Adjusted minimum width to 320px to support the wider layout'
      ]
    },
    {
      date: '12/01/26',
      title: 'React Deployment & Neocities Integration',
      items: [
        'Successfully deployed React site to Neocities with HashRouter for static hosting compatibility',
        'Configured automated git pre-push hook to build and deploy on every GitHub push',
        'Fixed MIME type issues by properly uploading dist folder instead of source files',
        'Updated all documentation files to first person perspective for personal use',
        'Site now features instant navigation with zero page reloads while maintaining all original design'
      ]
    },
    {
      date: '12/01/26',
      title: 'React Refactor Complete',
      items: [
        'Refactored website from vanilla HTML to React with React Router for better component management',
        'Migrated styling from plain Tailwind to Vite + Tailwind CSS v4 with PostCSS',
        'Updated all pages to use React components for easier maintenance and updates',
        'Preserved all historical content and styling from previous version'
      ]
    },
    {
      date: '19/11/25',
      items: [
        'Upgraded Curse of Semna page with modern Tailwind styling and interactive tabbed interface for game rules',
        'Integrated header image with navbar across all pages - navbar now overlays the bottom of the header image with translucent background',
        'Added visual current page markers with gray text and green underline for better navigation clarity',
        'Fixed numerous WebDAV filesystem issues during the modernization process'
      ]
    },
    {
      date: '07/09/25',
      items: [
        'Changed background a few times, settled on a texture with an animated gradient',
        'Added a scroll effect to the gradient so it changes as you scroll down the page',
        'Changed the header image to a more abstract one that fits the new background better',
        'Corrected some bad html on some pages'
      ]
    },
    {
      date: '06/09/25',
      items: [
        'Added some more socials',
        'Updated footer styling',
        'Moved footer from separate html file to inline HTML'
      ]
    },
    {
      date: '03/09/25',
      items: [
        'Added bluesky link',
        'Made the footer a separate html file like the updates section, so it can be called on new pages and updated easily',
        'Changed the font of the personal website for the course',
        'Changed some styling, including some advanced CSS for the footer'
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
    }
  ]

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
