// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useState } from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Helpdesk() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Help Desk</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <p className="mb-6 text-center text-indie-text-light text-xl">Need help or have a question? Fill out the form below and I'll get back to you as soon as possible!</p>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-indie-bg-dark rounded-lg p-6 border-2 border-indie-accent-green/50 space-y-4">
            
            <div>
              <label htmlFor="name" className="block text-indie-accent-green font-bold mb-2">Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-indie-accent-green font-bold mb-2">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none transition-colors"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-indie-accent-green font-bold mb-2">Subject *</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none transition-colors"
                placeholder="What is this about?"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-indie-accent-green font-bold mb-2">Message *</label>
              <textarea 
                id="message" 
                name="message" 
                required
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none transition-colors resize-none"
                placeholder="Your message here..."
              />
            </div>
            
            <div className="text-right">
              <button 
                type="submit"
                className="bg-indie-accent-green text-indie-bg-main px-8 py-3 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
              >
                Send Message
              </button>
            </div>
          </div>
        </form>
      </article>
    </PageWrapper>
  )
}
