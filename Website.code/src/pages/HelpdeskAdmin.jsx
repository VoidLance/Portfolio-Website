import React, { useEffect, useMemo, useState } from 'react'
import PageWrapper from '../components/PageWrapper'
import {
  addTicketReply,
  assignTicket,
  changeHelpdeskAdminPassword,
  clearHelpdeskSession,
  closeTicket,
  getHelpdeskSession,
  getTicketDetails,
  hasHelpdeskApiConfig,
  listTickets,
  loginHelpdeskAdmin,
  reopenTicket,
} from '../lib/helpdeskApi'

const initialLoginState = {
  email: '',
  password: '',
}

const initialPasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function HelpdeskAdmin() {
  const [loginForm, setLoginForm] = useState(initialLoginState)
  const [loginError, setLoginError] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [session, setSession] = useState(() => getHelpdeskSession())
  const [tickets, setTickets] = useState([])
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [noteMessage, setNoteMessage] = useState('')
  const [assignEmail, setAssignEmail] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [sendingNote, setSendingNote] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)
  const [passwordForm, setPasswordForm] = useState(initialPasswordFormState)
  const [changingPassword, setChangingPassword] = useState(false)

  const loadTickets = async (preferredTicketId = null) => {
    setLoadingTickets(true)

    try {
      const response = await listTickets()
      const nextTickets = response.tickets ?? []
      setTickets(nextTickets)

      const ticketIdToKeep = preferredTicketId ?? selectedTicketId
      if (ticketIdToKeep) {
        const stillExists = nextTickets.some((ticket) => ticket.id === ticketIdToKeep)
        if (stillExists) {
          setSelectedTicketId(ticketIdToKeep)
          return
        }
      }

      setSelectedTicketId(nextTickets[0]?.id ?? null)
    } catch (error) {
      console.error('Failed to load helpdesk tickets:', error)
      if (error.status === 401) {
        clearHelpdeskSession()
        setSession(null)
        setSelectedTicketId(null)
        setSelectedTicket(null)
      }
      setActionError(error.message || 'Failed to load tickets.')
    } finally {
      setLoadingTickets(false)
      setAuthLoading(false)
    }
  }

  const loadTicketDetails = async (ticketId) => {
    if (!ticketId) {
      setSelectedTicket(null)
      return
    }

    setLoadingTicketDetails(true)

    try {
      const response = await getTicketDetails(ticketId)
      setSelectedTicket(response.ticket ?? null)
      setAssignEmail(response.ticket?.assigneeEmail ?? '')
    } catch (error) {
      console.error('Failed to load ticket details:', error)
      setActionError(error.message || 'Failed to load ticket details.')
    } finally {
      setLoadingTicketDetails(false)
    }
  }

  useEffect(() => {
    if (!hasHelpdeskApiConfig) {
      setAuthLoading(false)
      return
    }

    if (!session?.token) {
      setAuthLoading(false)
      return
    }

    loadTickets()
  }, [])

  useEffect(() => {
    if (session?.token && selectedTicketId) {
      loadTicketDetails(selectedTicketId)
    } else if (!selectedTicketId) {
      setSelectedTicket(null)
    }
  }, [session?.token, selectedTicketId])

  const openTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'open' && ticket.assigneeEmail !== session?.admin?.email),
    [session?.admin?.email, tickets]
  )

  const assignedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'open' && ticket.assigneeEmail === session?.admin?.email),
    [session?.admin?.email, tickets]
  )

  const closedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'closed'),
    [tickets]
  )

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)

    try {
      const nextSession = await loginHelpdeskAdmin(loginForm)
      setSession(nextSession)
      setLoginForm(initialLoginState)
      setAuthLoading(true)
      await loadTickets()
    } catch (error) {
      console.error('Helpdesk admin login failed:', error)
      setLoginError(error.message || 'Login failed.')
      setAuthLoading(false)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    clearHelpdeskSession()
    setSession(null)
    setTickets([])
    setSelectedTicketId(null)
    setSelectedTicket(null)
    setReplyMessage('')
    setNoteMessage('')
    setAssignEmail('')
    setPasswordForm(initialPasswordFormState)
    setActionError(null)
    setActionNotice(null)
  }

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setActionError('Please fill in all password fields.')
      setActionNotice(null)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setActionError('New password and confirm password must match.')
      setActionNotice(null)
      return
    }

    setChangingPassword(true)
    setActionError(null)
    setActionNotice(null)

    try {
      await changeHelpdeskAdminPassword({
        previousPassword: passwordForm.currentPassword,
        nextPassword: passwordForm.newPassword,
      })
      setPasswordForm(initialPasswordFormState)
      setActionNotice('Password updated successfully.')
    } catch (error) {
      console.error('Failed to change admin password:', error)
      setActionError(error.message || 'Failed to update password.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSelectTicket = (ticket) => {
    setSelectedTicketId(ticket.id)
    setActionError(null)
    setActionNotice(null)
  }

  const runTicketAction = async (action, successMessage) => {
    if (!selectedTicketId) {
      return
    }

    setActionError(null)
    setActionNotice(null)

    try {
      await action()
      await loadTickets(selectedTicketId)
      await loadTicketDetails(selectedTicketId)
      setActionNotice(successMessage)
    } catch (error) {
      console.error('Ticket action failed:', error)
      setActionError(error.message || 'Action failed.')
    }
  }

  const handleAssignToMe = () => runTicketAction(
    () => assignTicket(selectedTicketId, { assigneeEmail: session?.admin?.email ?? '' }),
    'Ticket assigned to you.'
  )

  const handleUnassign = () => runTicketAction(
    () => assignTicket(selectedTicketId, { assigneeEmail: '' }),
    'Ticket unassigned.'
  )

  const handleAssignToEmail = () => runTicketAction(
    () => assignTicket(selectedTicketId, { assigneeEmail: assignEmail.trim() }),
    assignEmail.trim() ? 'Ticket reassigned.' : 'Ticket unassigned.'
  )

  const handleCloseTicket = () => runTicketAction(
    () => closeTicket(selectedTicketId),
    'Ticket closed.'
  )

  const handleReopenTicket = () => runTicketAction(
    () => reopenTicket(selectedTicketId),
    'Ticket reopened.'
  )

  const handleSendReply = async () => {
    if (!selectedTicketId || !replyMessage.trim()) {
      return
    }

    setSendingReply(true)
    setActionError(null)
    setActionNotice(null)

    try {
      await addTicketReply(selectedTicketId, {
        body: replyMessage.trim(),
        direction: 'outbound',
      })
      setReplyMessage('')
      await loadTickets(selectedTicketId)
      await loadTicketDetails(selectedTicketId)
      setActionNotice('Reply sent to customer.')
    } catch (error) {
      console.error('Failed to send helpdesk reply:', error)
      setActionError(error.message || 'Email reply failed.')
    } finally {
      setSendingReply(false)
    }
  }

  const handleSendNote = async () => {
    if (!selectedTicketId || !noteMessage.trim()) {
      return
    }

    setSendingNote(true)
    setActionError(null)
    setActionNotice(null)

    try {
      await addTicketReply(selectedTicketId, {
        body: noteMessage.trim(),
        direction: 'internal',
      })
      setNoteMessage('')
      await loadTicketDetails(selectedTicketId)
      setActionNotice('Internal note added.')
    } catch (error) {
      console.error('Failed to add internal note:', error)
      setActionError(error.message || 'Failed to add note.')
    } finally {
      setSendingNote(false)
    }
  }

  if (!hasHelpdeskApiConfig) {
    return (
      <PageWrapper>
        <h1 className="text-4xl text-indie-accent-green text-center mb-4">Helpdesk Admin</h1>
        <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
        <div className="max-w-2xl mx-auto bg-yellow-500/15 border border-yellow-500/50 rounded-lg p-5 text-indie-text-light">
          <p className="font-bold mb-2">AWS helpdesk API is not configured.</p>
          <p className="text-sm text-indie-text-gray">
            Set VITE_HELPDESK_API_BASE_URL after deploying the AWS backend to enable the admin dashboard.
          </p>
        </div>
      </PageWrapper>
    )
  }

  if (authLoading) {
    return (
      <PageWrapper>
        <p className="text-center text-indie-text-gray">Loading helpdesk dashboard...</p>
      </PageWrapper>
    )
  }

  if (!session?.token) {
    return (
      <PageWrapper>
        <h1 className="text-4xl text-indie-accent-green text-center mb-4">Admin Login</h1>
        <hr className="border-0 border-t border-indie-accent-green/50 my-4" />

        <form onSubmit={handleLogin} className="max-w-md mx-auto">
          <div className="bg-indie-bg-dark rounded-lg p-6 border-2 border-indie-accent-green/50 space-y-4">
            {loginError && (
              <div className="bg-red-500/20 border border-red-400 text-indie-text-light rounded-lg p-3 text-sm">
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-indie-accent-green font-bold mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-indie-accent-green font-bold mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indie-accent-green text-indie-bg-main px-6 py-3 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isLoggingIn ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper mainClassName="w-full">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-4xl text-indie-accent-green">Helpdesk Admin</h1>
          <p className="text-sm text-indie-text-gray mt-1">
            Signed in as {session.admin?.name || session.admin?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-indie-text-gray hover:text-indie-accent-green transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />

      <section className="mb-6 bg-indie-bg-dark rounded-lg border border-indie-accent-green/40 p-4">
        <h2 className="text-sm font-bold text-indie-accent-green mb-3">Change Password</h2>
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
          <div>
            <label htmlFor="currentPassword" className="block text-xs text-indie-text-gray/80 mb-1">Current password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordFieldChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-indie-bg-main border border-indie-accent-green/30 text-sm text-indie-text-light focus:border-indie-accent-green focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-xs text-indie-text-gray/80 mb-1">New password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordFieldChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-indie-bg-main border border-indie-accent-green/30 text-sm text-indie-text-light focus:border-indie-accent-green focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-xs text-indie-text-gray/80 mb-1">Confirm new password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordFieldChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-indie-bg-main border border-indie-accent-green/30 text-sm text-indie-text-light focus:border-indie-accent-green focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="bg-indie-accent-green text-indie-bg-main px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#1cdba2] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {changingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>

      {(actionError || actionNotice) && (
        <div className={`mb-4 rounded-lg border p-3 text-sm ${actionError ? 'bg-red-500/15 border-red-400 text-indie-text-light' : 'bg-indie-accent-green/15 border-indie-accent-green text-indie-text-light'}`}>
          {actionError || actionNotice}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1.2fr] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'open', title: 'Open', tickets: openTickets },
            { key: 'assigned', title: 'Assigned to Me', tickets: assignedTickets },
            { key: 'closed', title: 'Closed', tickets: closedTickets },
          ].map((column) => (
            <div key={column.key} className="bg-indie-bg-dark rounded-lg border border-indie-accent-green/40 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-indie-accent-green">{column.title}</h2>
                <span className="text-xs text-indie-text-gray">{column.tickets.length}</span>
              </div>
              <div className="space-y-3">
                {loadingTickets ? (
                  <p className="text-sm text-indie-text-gray/70 italic">Loading tickets...</p>
                ) : column.tickets.length === 0 ? (
                  <p className="text-sm text-indie-text-gray/70 italic">No tickets</p>
                ) : (
                  column.tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${
                        selectedTicketId === ticket.id
                          ? 'border-indie-accent-green bg-indie-bg-main'
                          : 'border-indie-accent-green/30 bg-indie-bg-main/40 hover:border-indie-accent-green/60'
                      }`}
                    >
                      <p className="text-sm text-indie-accent-pink font-bold line-clamp-2">{ticket.subject}</p>
                      <p className="text-xs text-indie-text-gray mt-2">{ticket.name}</p>
                      <p className="text-[11px] text-indie-text-gray/70 mt-1">{ticket.email}</p>
                      {ticket.assigneeEmail && (
                        <p className="text-[11px] text-indie-text-gray/70 mt-1">
                          Assigned: {ticket.assigneeEmail}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-indie-bg-dark rounded-lg border border-indie-accent-green/40 p-5">
          {!selectedTicketId ? (
            <div className="text-sm text-indie-text-gray/70 italic text-center">
              Select a ticket to view details and respond.
            </div>
          ) : loadingTicketDetails || !selectedTicket ? (
            <div className="text-sm text-indie-text-gray/70 italic text-center">
              Loading ticket details...
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl text-indie-accent-pink font-bold">{selectedTicket.subject}</h2>
                <p className="text-sm text-indie-text-gray mt-1">
                  From {selectedTicket.name} ({selectedTicket.email})
                </p>
                <p className="text-xs text-indie-text-gray/70 mt-1">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="bg-indie-bg-main rounded-lg p-4">
                <p className="text-indie-text-light whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAssignToMe}
                    className="bg-indie-accent-green text-indie-bg-main px-3 py-2 rounded-lg text-sm font-bold hover:bg-[#1cdba2] transition-colors cursor-pointer"
                  >
                    Assign to me
                  </button>
                  <button
                    onClick={handleUnassign}
                    className="bg-indie-bg-main text-indie-text-light px-3 py-2 rounded-lg text-sm border border-indie-accent-green/40 hover:border-indie-accent-green/70 transition-colors cursor-pointer"
                  >
                    Unassign
                  </button>
                  {selectedTicket.status === 'closed' ? (
                    <button
                      onClick={handleReopenTicket}
                      className="bg-indie-accent-green text-indie-bg-main px-3 py-2 rounded-lg text-sm font-bold hover:bg-[#1cdba2] transition-colors cursor-pointer"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      onClick={handleCloseTicket}
                      className="bg-indie-text-gray text-indie-bg-main px-3 py-2 rounded-lg text-sm font-bold hover:bg-indie-text-gray/80 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-indie-text-gray/70">Assign to user (email)</label>
                  <div className="flex gap-2">
                    <input
                      value={assignEmail}
                      onChange={(event) => setAssignEmail(event.target.value)}
                      placeholder="user@example.com"
                      className="flex-1 px-3 py-2 rounded-lg bg-indie-bg-main border border-indie-accent-green/30 text-sm text-indie-text-light focus:border-indie-accent-green focus:outline-none"
                    />
                    <button
                      onClick={handleAssignToEmail}
                      className="bg-indie-accent-pink text-indie-text-light px-3 py-2 rounded-lg text-sm font-bold hover:bg-indie-accent-pink/80 transition-colors cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                  {selectedTicket.assigneeEmail && (
                    <p className="text-xs text-indie-text-gray/70">
                      Current assignee: {selectedTicket.assigneeEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-indie-accent-green">Conversation & Notes</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {selectedTicket.replies?.length ? (
                    selectedTicket.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          reply.direction === 'inbound'
                            ? 'border-indie-accent-green/40 bg-indie-bg-main'
                            : reply.direction === 'internal'
                              ? 'border-yellow-500/40 bg-indie-bg-main/80'
                              : 'border-indie-accent-pink/40 bg-indie-bg-main/60'
                        }`}
                      >
                        <div className="flex justify-between text-[11px] text-indie-text-gray/70 mb-1 gap-2">
                          <span>
                            {reply.direction === 'internal'
                              ? `INTERNAL NOTE (${reply.authorEmail})`
                              : `${reply.direction?.toUpperCase() || 'OUTBOUND'}${reply.authorEmail ? ` • ${reply.authorEmail}` : ''}`}
                          </span>
                          <span>{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-indie-text-light whitespace-pre-wrap">{reply.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-indie-text-gray/70 italic">No replies or notes yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-indie-accent-green">Email Reply to Customer</label>
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  placeholder="Type your email reply to the customer..."
                  className="w-full px-3 py-2 rounded-lg bg-indie-bg-main border border-indie-accent-green/30 text-sm text-indie-text-light focus:border-indie-accent-green focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply}
                    className="bg-indie-accent-pink text-indie-text-light px-4 py-2 rounded-lg text-sm font-bold hover:bg-indie-accent-pink/80 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {sendingReply ? 'Sending...' : 'Send Email Reply'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-yellow-500">Internal Note (Admin Only)</label>
                <textarea
                  rows="3"
                  value={noteMessage}
                  onChange={(event) => setNoteMessage(event.target.value)}
                  placeholder="Add an internal note visible only to admins..."
                  className="w-full px-3 py-2 rounded-lg bg-indie-bg-main border border-yellow-500/30 text-sm text-indie-text-light focus:border-yellow-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendNote}
                    disabled={sendingNote}
                    className="bg-yellow-600 text-indie-bg-main px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {sendingNote ? 'Adding...' : 'Add Internal Note'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </PageWrapper>
  )
}