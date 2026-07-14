// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useEffect, useState } from 'react'
import PageWrapper from '../components/PageWrapper'

const GITHUB_OWNER = 'VoidLance'
const REPOS_PER_PAGE = 100

const STACK_HINTS = [
  { test: /next/i, category: 'Next.js' },
  { test: /react/i, category: 'React' },
  { test: /typescript/i, category: 'TypeScript' },
  { test: /javascript/i, category: 'JavaScript' },
  { test: /php/i, category: 'PHP' },
  { test: /python/i, category: 'Python' },
  { test: /java/i, category: 'Java' },
  { test: /c\+\+/i, category: 'C++' },
  { test: /c#/i, category: 'C#' },
  { test: /html|css/i, category: 'HTML/CSS' },
]

const CATEGORY_PRIORITY = [
  'Next.js',
  'React',
  'TypeScript',
  'JavaScript',
  'PHP',
  'Python',
  'Java',
  'C++',
  'C#',
  'HTML/CSS',
  'Other',
]

function inferCategory(repo) {
  const searchText = `${repo.name ?? ''} ${repo.description ?? ''} ${repo.language ?? ''}`

  for (const hint of STACK_HINTS) {
    if (hint.test.test(searchText)) {
      if ((hint.category === 'React' || hint.category === 'Next.js') && /javascript|typescript/i.test(searchText)) {
        return hint.category
      }

      if (hint.category === 'JavaScript' && /react|next/i.test(searchText)) {
        return 'JavaScript'
      }

      if (hint.category === 'TypeScript' && /react|next/i.test(searchText)) {
        return 'TypeScript'
      }

      return hint.category
    }
  }

  return repo.language || 'Other'
}

function formatPushDate(dateString) {
  if (!dateString) {
    return 'Unknown update'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

function getCategoryRank(category) {
  const rank = CATEGORY_PRIORITY.indexOf(category)
  return rank === -1 ? CATEGORY_PRIORITY.length : rank
}

function groupReposByCategory(repos) {
  const grouped = repos.reduce((accumulator, repo) => {
    const category = inferCategory(repo)

    if (!accumulator[category]) {
      accumulator[category] = []
    }

    accumulator[category].push(repo)
    return accumulator
  }, {})

  return Object.entries(grouped)
    .sort(([leftCategory], [rightCategory]) => {
      const rankDelta = getCategoryRank(leftCategory) - getCategoryRank(rightCategory)

      if (rankDelta !== 0) {
        return rankDelta
      }

      return leftCategory.localeCompare(rightCategory)
    })
    .map(([category, categoryRepos]) => ({
      category,
      repos: categoryRepos.sort((leftRepo, rightRepo) => {
        const leftUpdated = new Date(leftRepo.pushed_at || leftRepo.updated_at || 0).getTime()
        const rightUpdated = new Date(rightRepo.pushed_at || rightRepo.updated_at || 0).getTime()

        return rightUpdated - leftUpdated
      }),
    }))
}

export default function Software() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchRepos = async () => {
      setLoading(true)
      setError(null)

      try {
        const allRepos = []
        let page = 1
        let keepFetching = true

        while (keepFetching) {
          const response = await fetch(
            `https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=${REPOS_PER_PAGE}&page=${page}&type=owner&sort=pushed&direction=desc`,
            {
              signal: abortController.signal,
              cache: 'no-store',
              headers: {
                Accept: 'application/vnd.github+json',
              },
            }
          )

          if (!response.ok) {
            throw new Error(`GitHub request failed with status ${response.status}`)
          }

          const pageRepos = await response.json()

          if (!Array.isArray(pageRepos)) {
            throw new Error('Unexpected GitHub response shape')
          }

          allRepos.push(...pageRepos.filter(repo => !repo.fork && !repo.archived))

          keepFetching = pageRepos.length === REPOS_PER_PAGE
          page += 1
        }

        setRepos(allRepos)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to load live GitHub repositories.')
          console.error('GitHub API error:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()

    return () => abortController.abort()
  }, [])

  const groupedRepos = groupReposByCategory(repos)

  return (
    <PageWrapper>
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Software</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />

      <article className="text-indie-text-gray">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Movie Review App</h2>
            <p className="mb-4">A full-featured movie review application built with Next.js, featuring TMDB API integration, search functionality, dark mode, and advanced filtering.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a
              href="/Software/Movie-Review-App/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>

          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Personal Website</h2>
            <p className="mb-4">A responsive portfolio website created as a course project, featuring modern design and smooth navigation.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a
              href="/Software/Personal-Website/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>

          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Pokemon Team Finder</h2>
            <p className="mb-4">An interactive tool to help build optimal Pokemon teams with type coverage analysis.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a
              href="/Software/Pokemon-Team-Finder/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>

          <div className="glass-darker p-6 rounded-lg border-2 border-indie-accent-green/50">
            <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">Banking App</h2>
            <p className="mb-4">A banking simulation application showcasing account management and transactions.</p>
            <p className="text-sm text-indie-text-gray/70 italic mb-4">Status: Completed</p>
            <a
              href="/Software/Banking/html/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-indie-accent-green text-indie-bg-main px-6 py-2 rounded-lg font-bold hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              View Project →
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-indie-accent-green/20">
          <div className="mb-4 flex flex-col gap-2">
            <h2 className="text-xl text-indie-accent-green font-bold">Live GitHub Projects</h2>
            <p className="text-sm text-indie-text-gray/60">
              This list is fetched directly from GitHub, so it updates automatically after each push.
            </p>
          </div>

          {loading && (
            <p className="text-sm text-indie-text-gray/50 italic">Loading repositories from GitHub...</p>
          )}

          {error && (
            <p className="text-sm text-red-400/70">{error}</p>
          )}

          {!loading && !error && groupedRepos.length === 0 && (
            <p className="text-sm text-indie-text-gray/50 italic">No public repositories found on GitHub.</p>
          )}

          {!loading && !error && groupedRepos.length > 0 && (
            <div className="space-y-4">
              {groupedRepos.map(group => (
                <details
                  key={group.category}
                  className="glass-darker rounded-lg border border-indie-accent-green/20 open:border-indie-accent-green/40 transition-colors"
                >
                  <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-4 text-indie-text-light hover:text-indie-accent-green transition-colors">
                    <span className="font-semibold">{group.category}</span>
                    <span className="text-xs text-indie-text-gray/60 whitespace-nowrap">
                      {group.repos.length} repo{group.repos.length === 1 ? '' : 's'}
                    </span>
                  </summary>

                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {group.repos.map(repo => (
                        <a
                          key={repo.id}
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-effect p-4 rounded-lg border border-indie-accent-green/20 hover:border-indie-accent-green/50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="text-base font-semibold text-indie-text-light group-hover:text-indie-accent-green transition-colors break-words">
                              {repo.name}
                            </div>
                            {repo.stargazers_count > 0 && (
                              <span className="text-[11px] text-indie-text-gray/60 whitespace-nowrap">
                                ★ {repo.stargazers_count}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-indie-text-gray/75 mb-3 min-h-[3.75rem] line-clamp-3">
                            {repo.description || 'No description provided.'}
                          </p>

                          <div className="flex items-center justify-between gap-3 text-xs text-indie-text-gray/55">
                            <span>{repo.language || 'Other'}</span>
                            <span>Updated {formatPushDate(repo.pushed_at || repo.updated_at)}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </article>
    </PageWrapper>
  )
}
