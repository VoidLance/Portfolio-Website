// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useState, useEffect } from 'react'
import PageWrapper from '../components/PageWrapper'
import { supabase } from '../lib/supabase'

export default function HelpdeskAdmin() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyMessage, setReplyMessage] = useState('')
  const [noteMessage, setNoteMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [sendingNote, setSendingNote] = useState(false)
  const [assignEmail, setAssignEmail] = useState('')
  const [actionError, setActionError] = useState(null)
  
  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchTickets()
    }
  }, [user])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      setUser(data.user)
    } catch (error) {
      setLoginError(error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTickets([])
  }

  const fetchTickets = async () => {
    try {
      const query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setTickets(data || [])

      if (selectedTicket) {
        const refreshed = (data || []).find((ticket) => ticket.id === selectedTicket.id)
        if (refreshed) {
          setSelectedTicket(refreshed)
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const updateTicket = async (ticketId, updates) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)

      if (error) throw error
      fetchTickets() // Refresh the list
    } catch (error) {
      console.error('Error updating ticket:', error)
      setActionError('Could not update ticket. Please try again.')
    }
  }

  const fetchReplies = async (ticketId) => {
    try {
      const { data, error } = await supabase
        .from('ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setReplies(data || [])
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket)
    setAssignEmail(ticket.assignee_email || '')
    setReplyMessage('')
    setActionError(null)
    fetchReplies(ticket.id)
  }

  const handleAssignToMe = () => {
    if (!user || !selectedTicket) return
    const nextEmail = user.email
    if (shouldNotifyAssignee(nextEmail)) {
      sendAssignmentNotification(selectedTicket.id, nextEmail, selectedTicket.subject)
    }
    updateTicket(selectedTicket.id, {
      assignee_email: nextEmail,
      status: 'open',
      resolved_at: null,
    })
  }

  const handleUnassign = () => {
    if (!selectedTicket) return
    updateTicket(selectedTicket.id, {
      assignee_email: null,
      status: 'open',
      resolved_at: null,
    })
  }

  const handleAssignToEmail = () => {
    if (!selectedTicket || !assignEmail.trim()) return
    const nextEmail = assignEmail.trim()
    
    if (shouldNotifyAssignee(nextEmail)) {
      sendAssignmentNotification(selectedTicket.id, nextEmail, selectedTicket.subject)
    }
    
    updateTicket(selectedTicket.id, {
      assignee_email: nextEmail,
      status: 'open',
      resolved_at: null,
    })
  }

  const shouldNotifyAssignee = (nextEmail) => {
    if (!selectedTicket || !nextEmail) return false
    return nextEmail !== selectedTicket.assignee_email
  }

  const sendAssignmentNotification = async (ticketId, assigneeEmail, subject) => {
    try {
      const response = await fetch(
        'https://vmmgyzzqotovzyddkxnm.supabase.co/functions/v1/ticket-notifications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'ticket_assigned',
            ticketId,
            ticketSubject: subject,
            toEmail: assigneeEmail,
            assigneeName: assigneeEmail.split('@')[0],
          }),
        }
      )

      if (!response.ok) {
        console.error('Failed to send assignment notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const handleCloseTicket = () => {
    if (!selectedTicket) return
    updateTicket(selectedTicket.id, {
      status: 'closed',
      resolved_at: new Date().toISOString(),
    })
  }

  const handleReopenTicket = () => {
    if (!selectedTicket) return
    updateTicket(selectedTicket.id, {
      status: 'open',
      resolved_at: null,
    })
  }

  const handleSendNote = async () => {
    if (!selectedTicket || !noteMessage.trim()) return
    setSendingNote(true)
    setActionError(null)

    try {
      const { error } = await supabase
        .from('ticket_replies')
        .insert([
          {
            ticket_id: selectedTicket.id,
            author_email: user?.email || 'admin',
            body: noteMessage.trim(),
            direction: 'internal',
            message_id: null,
          },
        ])

      if (error) throw error

      setNoteMessage('')
      fetchReplies(selectedTicket.id)
    } catch (error) {
      console.error('Error adding note:', error)
      setActionError('Failed to add note. Please try again.')
    } finally {
      setSendingNote(false)
    }
  }

  const handleSendEmailReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return
    setSendingReply(true)
    setActionError(null)

    try {
      const response = await fetch(
        'https://vmmgyzzqotovzyddkxnm.supabase.co/functions/v1/helpdesk-reply',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId: selectedTicket.id,
            to: selectedTicket.email,
            subject: `Re: ${selectedTicket.subject}`,
            message: replyMessage.trim(),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const outboundMessageId = data?.messageId || null

      const { error: insertError } = await supabase
        .from('ticket_replies')
        .insert([
          {
            ticket_id: selectedTicket.id,
            author_email: user?.email || 'admin',
            body: replyMessage.trim(),
            direction: 'outbound',
            message_id: outboundMessageId,
          },
        ])

      if (insertError) throw insertError

      setReplyMessage('')
      fetchReplies(selectedTicket.id)
      fetchTickets()
    } catch (error) {
      console.error('Error sending reply:', error)
      setActionError('Email reply failed. Please try again.')
    } finally {
      setSendingReply(false)
    }
  }

  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'open' && ticket.assignee_email !== user?.email
  )
  const assignedTickets = tickets.filter(
    (ticket) => ticket.status === 'open' && ticket.assignee_email === user?.email
  )
  const closedTickets = tickets.filter((ticket) => ticket.status === 'closed')

  // Login Screen
  if (loading) {
    return (
      <PageWrapper>
        <p className="text-center text-indie-text-gray">Loading...</p>
      </PageWrapper>
    )
  }

  if (!user) {
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-indie-accent-green font-bold mb-2">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-indie-bg-main border-2 border-indie-accent-green/50 rounded-lg text-indie-text-light focus:border-indie-accent-green focus:outline-none"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-indie-accent-green text-indie-bg-main px-6 py-3 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </PageWrapper>
    )
  }

  // Admin Dashboard
  return (
    <PageWrapper mainClassName="w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl text-indie-accent-green">Helpdesk Admin</h1>
        <button 
          onClick={handleLogout}
          className="text-sm text-indie-text-gray hover:text-indie-accent-green transition-colors"
        >
          Logout
        </button>
      </div>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />

      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1.2fr] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indie-bg-dark rounded-lg border border-indie-accent-green/40 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-indie-accent-green">Open</h2>
              <span className="text-xs text-indie-text-gray">{openTickets.length}</span>
            </div>
            <div className="space-y-3">
              {openTickets.length === 0 ? (
                <p className="text-sm text-indie-text-gray/70 italic">No open tickets</p>
              ) : (
                openTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'border-indie-accent-green bg-indie-bg-main'
                        : 'border-indie-accent-green/30 bg-indie-bg-main/40 hover:border-indie-accent-green/60'
                    }`}
                  >
                    <p className="text-sm text-indie-accent-pink font-bold line-clamp-2">{ticket.subject}</p>
                    <p className="text-xs text-indie-text-gray mt-2">{ticket.name}</p>
                    {ticket.assignee_email && (
                      <p className="text-[11px] text-indie-text-gray/70 mt-1">
                        Assigned: {ticket.assignee_email}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-indie-bg-dark rounded-lg border border-indie-accent-green/40 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-indie-accent-green">Assigned to Me</h2>
              <span className="text-xs text-indie-text-gray">{assignedTickets.length}</span>
            </div>
            <div className="space-y-3">
              {assignedTickets.length === 0 ? (
                <p className="text-sm text-indie-text-gray/70 italic">No assigned tickets</p>
              ) : (
                assignedTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'border-indie-accent-green bg-indie-bg-main'
                        : 'border-indie-accent-green/30 bg-indie-bg-main/40 hover:border-indie-accent-green/60'
                    }`}
                  >
                    <p className="text-sm text-indie-accent-pink font-bold line-clamp-2">{ticket.subject}</p>
                    <p className="text-xs text-indie-text-gray mt-2">{ticket.name}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-indie-bg-dark rounded-lg border border-indie-accent-green/40 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-indie-accent-green">Closed</h2>
              <span className="text-xs text-indie-text-gray">{closedTickets.length}</span>
            </div>
            <div className="space-y-3">
              {closedTickets.length === 0 ? (
                <p className="text-sm text-indie-text-gray/70 italic">No closed tickets</p>
              ) : (
                closedTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'border-indie-accent-green bg-indie-bg-main'
                        : 'border-indie-accent-green/30 bg-indie-bg-main/40 hover:border-indie-accent-green/60'
                    }`}
                  >
                    <p className="text-sm text-indie-text-gray/90 font-bold line-clamp-2">{ticket.subject}</p>
                    <p className="text-xs text-indie-text-gray mt-2">{ticket.name}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="bg-indie-bg-dark rounded-lg border border-indie-accent-green/40 p-5">
          {!selectedTicket ? (
            <div className="text-sm text-indie-text-gray/70 italic text-center">
              Select a ticket to view details and respond.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl text-indie-accent-pink font-bold">
                  {selectedTicket.subject}
                </h2>
                <p className="text-sm text-indie-text-gray mt-1">
                  From {selectedTicket.name} ({selectedTicket.email})
                </p>
                <p className="text-xs text-indie-text-gray/70 mt-1">
                  {new Date(selectedTicket.created_at).toLocaleString()}
                </p>
              </div>

              <div className="bg-indie-bg-main rounded-lg p-4">
                <p className="text-indie-text-light whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAssignToMe}
                    className="bg-indie-accent-green text-indie-bg-main px-3 py-2 rounded-lg text-sm font-bold hover:bg-[#1cdba2] transition-colors"
                  >
                    Assign to me
                  </button>
                  <button
                    onClick={handleUnassign}
                    className="bg-indie-bg-main text-indie-text-light px-3 py-2 rounded-lg text-sm border border-indie-accent-green/40 hover:border-indie-accent-green/70 transition-colors"
                  >
                    Unassign
                  </button>
                  {selectedTicket.status === 'closed' ? (
                    <button
                      onClick={handleReopenTicket}
                      className="bg-indie-accent-green text-indie-bg-main px-3 py-2 rounded-lg text-sm font-bold hover:bg-[#1cdba2] transition-colors"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      onClick={handleCloseTicket}
                      className="bg-indie-text-gray text-indie-bg-main px-3 py-2 rounded-lg text-sm font-bold hover:bg-indie-text-gray/80 transition-colors"
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
                      onChange={(e) => setAssignEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="flex-1 px-3 py-2 rounded-lg bg-indie-bg-main border border-indie-accent-green/30 text-sm text-indie-text-light focus:border-indie-accent-green focus:outline-none"
                    />
                    <button
                      onClick={handleAssignToEmail}
                      className="bg-indie-accent-pink text-indie-text-light px-3 py-2 rounded-lg text-sm font-bold hover:bg-indie-accent-pink/80 transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                  {selectedTicket.assignee_email && (
                    <p className="text-xs text-indie-text-gray/70">
                      Current assignee: {selectedTicket.assignee_email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-indie-accent-green">Conversation & Notes</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {replies.length === 0 ? (
                    <p className="text-xs text-indie-text-gray/70 italic">No replies or notes yet.</p>
                  ) : (
                    replies.map((reply) => (
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
                        <div className="flex justify-between text-[11px] text-indie-text-gray/70 mb-1">
                          <span>
                            {reply.direction === 'internal' 
                              ? `INTERNAL NOTE (${reply.author_email})` 
                              : reply.direction?.toUpperCase() || 'OUTBOUND'}
                          </span>
                          <span>{new Date(reply.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-indie-text-light whitespace-pre-wrap">{reply.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-indie-accent-green">Email Reply to Customer</label>
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your email reply to the customer..."
                  className="w-full px-3 py-2 rounded-lg bg-indie-bg-main border border-indie-accent-green/30 text-sm text-indie-text-light focus:border-indie-accent-green focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendEmailReply}
                    disabled={sendingReply}
                    className="bg-indie-accent-pink text-indie-text-light px-4 py-2 rounded-lg text-sm font-bold hover:bg-indie-accent-pink/80 transition-colors disabled:opacity-60"
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
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder="Add an internal note visible only to admins..."
                  className="w-full px-3 py-2 rounded-lg bg-indie-bg-main border border-yellow-500/30 text-sm text-indie-text-light focus:border-yellow-500 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendNote}
                    disabled={sendingNote}
                    className="bg-yellow-600 text-indie-bg-main px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-500 transition-colors disabled:opacity-60"
                  >
                    {sendingNote ? 'Adding...' : 'Add Internal Note'}
                  </button>
                </div>
                {actionError && (
                  <p className="text-xs text-red-400/80">{actionError}</p>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </PageWrapper>
  )
}
