// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useEffect, useState } from 'react'
import PageWrapper from '../components/PageWrapper'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Load blog posts from Blogger RSS feed using JSONP to avoid CORS
    const handleBlogCallback = (data) => {
      if (data.feed && data.feed.entry) {
        const blogPosts = data.feed.entry.map(entry => ({
          title: entry.title.$t,
          content: entry.content ? entry.content.$t : (entry.summary ? entry.summary.$t : ''),
          link: entry.link.find(l => l.rel === 'alternate').href,
          published: new Date(entry.published.$t).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }))
        setPosts(blogPosts)
      }
      setLoading(false)
    }

    // Store callback in window
    window.blogCallback = handleBlogCallback

    // Load script
    const script = document.createElement('script')
    script.src = 'https://voidlance.blogspot.com/feeds/posts/default?alt=json-in-script&callback=blogCallback&max-results=5'
    script.onerror = () => {
      setError(true)
      setLoading(false)
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const getPlainText = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4">Blog</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="bg-indie-bg-dark p-6 rounded-lg border-2 border-indie-accent-green/50 mb-6">
          <h2 className="text-2xl text-indie-accent-green mb-4 text-center font-bold">VoidLance Blog</h2>
          <p className="text-center mb-4 text-indie-text-light text-lg">Read my latest thoughts, game development updates, and creative writing.</p>
          <div className="text-center">
            <a 
              href="https://voidlance.blogspot.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-indie-accent-green text-indie-bg-main px-8 py-3 rounded-lg font-bold text-xl hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              Visit Full Blog →
            </a>
          </div>
        </div>
        
        <div id="blog-posts" className="space-y-6">
          {loading && <p className="text-center italic">Loading blog posts...</p>}
          {error && (
            <p className="text-center text-indie-accent-pink">
              Unable to load blog posts. <a href="https://voidlance.blogspot.com" target="_blank" rel="noopener noreferrer">Visit the blog directly.</a>
            </p>
          )}
          {!loading && !error && posts.length === 0 && (
            <p className="text-center">No posts found. <a href="https://voidlance.blogspot.com" target="_blank" className="text-indie-accent-green hover:underline">Visit the blog directly.</a></p>
          )}
          {posts.map((post, index) => {
            const preview = getPlainText(post.content).substring(0, 300)
            return (
              <div key={index} className="bg-indie-bg-dark p-5 rounded-lg border border-indie-accent-green/30 hover:border-indie-accent-green/60 transition-colors">
                <h3 className="text-2xl text-indie-accent-green font-bold mb-2">
                  <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#1cdba2] transition-colors">{post.title}</a>
                </h3>
                <p className="text-indie-accent-pink text-sm mb-3 italic">{post.published}</p>
                <p className="text-indie-text-gray mb-4">{preview}{preview.length >= 300 ? '...' : ''}</p>
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-indie-accent-green hover:underline font-bold">Read full post →</a>
              </div>
            )
          })}
        </div>
      </article>
    </PageWrapper>
  )
}
