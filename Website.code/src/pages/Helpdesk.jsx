// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/PageWrapper'
import {
  createTicket,
  getHelpdeskSession,
  hasHelpdeskApiConfig,
  loginHelpdeskAdmin,
} from '../lib/helpdeskApi'

const initialFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export default function Helpdesk() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [submittedTicketId, setSubmittedTicketId] = useState(null)
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' })
  const [adminSubmitting, setAdminSubmitting] = useState(false)
  const [adminError, setAdminError] = useState(null)

  const existingSession = getHelpdeskSession()

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

  const handleAdminChange = (event) => {
    const { name, value } = event.target
    setAdminCredentials((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleAdminLogin = async (event) => {
    event.preventDefault()
    setAdminError(null)
    setAdminSubmitting(true)

    try {
      await loginHelpdeskAdmin(adminCredentials)
      navigate('/helpdesk/admin')
    } catch (error) {
      console.error('Helpdesk admin login from public page failed:', error)
      setAdminError(error.message || 'Admin login failed.')
    } finally {
      setAdminSubmitting(false)
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

        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-indie-bg-dark rounded-lg p-6 border-2 border-indie-accent-green/35 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl text-indie-accent-green font-bold">Admin Access</h2>
              {existingSession?.token && (
                <span className="text-xs text-indie-text-gray/70">Existing session found</span>
              )}
            </div>

            <p className="text-sm text-indie-text-gray/75">
              If you are an admin, sign in here and jump straight to the dashboard.
            </p>

            {adminError && (
              <div className="bg-red-500/20 border border-red-400 text-indie-text-light rounded-lg p-3 text-sm">
                {adminError}
              </div>
            )}

            {existingSession?.token ? (
              <Link
                to="/helpdesk/admin"
                className="inline-flex items-center bg-indie-accent-green text-indie-bg-main px-5 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <form onSubmit={handleAdminLogin} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <div>
                  <label htmlFor="admin-email" className="block text-indie-accent-green font-bold mb-2">Admin Email</label>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    required
                    value={adminCredentials.email}
                    onChange={handleAdminChange}
                    className="w-full px-3 py-2 bg-indie-bg-main border-2 border-indie-accent-green/40 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="admin-password" className="block text-indie-accent-green font-bold mb-2">Password</label>
                  <input
                    id="admin-password"
                    name="password"
                    type="password"
                    required
                    value={adminCredentials.password}
                    onChange={handleAdminChange}
                    className="w-full px-3 py-2 bg-indie-bg-main border-2 border-indie-accent-green/40 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none"
                    placeholder="Admin password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminSubmitting || !hasHelpdeskApiConfig}
                  className="bg-indie-accent-pink text-indie-text-light px-5 py-2 rounded-lg font-bold hover:bg-indie-accent-pink/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {adminSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>
        </div>

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
