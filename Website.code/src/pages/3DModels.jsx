import React from 'react'
import PageWrapper from '../components/PageWrapper'

export default function ThreeDModels() {
  const models = [
    {
      title: 'Fantasy Weaponstore Diorama',
      src: 'https://sketchfab.com/models/d917dfc6027042ad8dd566e0fc953a70/embed'
    },
    {
      title: 'Stone Sword',
      src: 'https://sketchfab.com/models/9736caf0ff8146d49a2b6742f52fb7d6/embed'
    },
    {
      title: 'Leaf Blade Sword',
      src: 'https://sketchfab.com/models/d8e7b1f027ef405da70ee602a191bac7/embed'
    },
    {
      title: 'Gate',
      src: 'https://sketchfab.com/models/63810c274dd44f02a70f148fabd53897/embed'
    },
    {
      title: 'Store Counter',
      src: 'https://sketchfab.com/models/c160eb255df34ad581c62b4dbc1ba9f8/embed'
    },
    {
      title: "Carp's Tongue Sword",
      src: 'https://sketchfab.com/models/0724695f7b83454b8aa1144b193f9a59/embed'
    },
    {
      title: 'Notice',
      src: 'https://sketchfab.com/models/d29ef609ed0b4e088f884c9b67a3a9ea/embed'
    },
  ]

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">3D Models</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <p className="mb-6 text-center">Check out my 3D modeling projects from Sketchfab!</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map((model, index) => (
            <div key={index} className="bg-indie-bg-dark rounded-lg p-3 border border-indie-accent-green/30">
              <h3 className="text-indie-accent-green text-lg font-bold mb-2 text-center">{model.title}</h3>
              <iframe 
                src={model.src}
                frameBorder="0" 
                allowFullScreen
                allow="autoplay; fullscreen; xr-spatial-tracking"
                className="w-full h-[600px] rounded"
                title={model.title}
              ></iframe>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <a href="https://sketchfab.com/VoidLance" target="_blank" rel="noopener noreferrer" className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-3 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie">
            View All Models on Sketchfab →
          </a>
        </div>
      </article>
    </PageWrapper>
  )
}
