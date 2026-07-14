// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useState } from 'react'
import PageWrapper from '../components/PageWrapper'
import { createTicket, hasHelpdeskApiConfig } from '../lib/helpdeskApi'

const initialFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export default function Helpdesk() {
  const [formData, setFormData] = useState(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [submittedTicketId, setSubmittedTicketId] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!hasHelpdeskApiConfig) {
      setSubmitStatus('unconfigured')
      return
    }

    setSubmitting(true)
    setSubmitStatus(null)
    setSubmittedTicketId(null)

    try {
      const response = await createTicket(formData)
      setFormData(initialFormData)
      setSubmittedTicketId(response.ticket?.id ?? null)
      setSubmitStatus('success')
    } catch (error) {
      console.error('Helpdesk ticket submission failed:', error)
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Help Desk</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />

      <article className="text-indie-text-gray">
        <p className="mb-6 text-center text-indie-text-light text-xl">
          Need help or have a question? Open a ticket and it will land in the AWS-backed
          helpdesk dashboard.
        </p>

        {!hasHelpdeskApiConfig && (
          <div className="max-w-2xl mx-auto mb-6 bg-yellow-500/15 border border-yellow-500/50 rounded-lg p-4 text-sm text-indie-text-light">
            Helpdesk API is not configured yet. Set <span className="font-bold">VITE_HELPDESK_API_BASE_URL</span> to enable ticket submission.
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="bg-indie-bg-dark rounded-lg p-6 border-2 border-indie-accent-green/50 space-y-4">
            {submitStatus === 'success' && (
              <div className="bg-indie-accent-green/20 border border-indie-accent-green text-indie-text-light rounded-lg p-4 mb-4">
                <p className="font-bold">Ticket submitted successfully.</p>
                <p className="text-sm mt-1">
                  Thanks for reaching out. I will reply from the helpdesk system as soon as possible.
                </p>
                {submittedTicketId && (
                  <p className="text-xs mt-2 text-indie-text-gray">Reference: {submittedTicketId}</p>
                )}
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-500/20 border border-red-400 text-indie-text-light rounded-lg p-4 mb-4">
                <p className="font-bold">Failed to submit ticket.</p>
                <p className="text-sm mt-1">
                  Please try again or email me directly at alistair.m.sweeting@gmail.com.
                </p>
              </div>
            )}

            {submitStatus === 'unconfigured' && (
              <div className="bg-yellow-500/20 border border-yellow-400 text-indie-text-light rounded-lg p-4 mb-4">
                <p className="font-bold">Helpdesk backend not configured.</p>
                <p className="text-sm mt-1">Add the AWS API base URL before using the contact form.</p>
              </div>
            )}

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
                placeholder="Describe the issue or question in as much detail as you need."
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indie-accent-green text-indie-bg-main px-8 py-3 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Open Ticket'}
              </button>
            </div>
          </div>
        </form>
      </article>
    </PageWrapper>
  )
}
