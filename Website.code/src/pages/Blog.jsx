// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import PageWrapper from '../components/PageWrapper'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedPost])

  useEffect(() => {
    // Update meta tags for blog page SEO
    document.title = 'Blog - Alistair Sweeting'
    
    const metaTags = [
      { name: 'description', content: 'Read my latest blog posts about game development, indie game design, creative coding, and digital art. Follow my thoughts and project updates.' },
      { property: 'og:title', content: 'Blog - Alistair Sweeting' },
      { property: 'og:description', content: 'Read my latest blog posts about game development, indie game design, creative coding, and digital art.' },
      { property: 'og:type', content: 'blog' },
      { property: 'og:url', content: 'https://alistairsweeting.com/blog' }
    ]

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[${tag.name ? 'name' : 'property'}="${tag.name || tag.property}"]`)
      if (!element) {
        element = document.createElement('meta')
        if (tag.name) element.name = tag.name
        if (tag.property) element.setAttribute('property', tag.property)
        document.head.appendChild(element)
      }
      element.content = tag.content
    })
  }, [])

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
          }),
          publishedISO: entry.published.$t,
          author: entry.author[0].name.$t,
          summary: entry.summary ? entry.summary.$t : ''
        }))
        setPosts(blogPosts)
        
        // Add structured data after posts are loaded
        addStructuredData(blogPosts)
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

  const addStructuredData = (posts) => {
    // Remove old structured data scripts
    const oldScripts = document.querySelectorAll('script[data-blog-schema="true"]')
    oldScripts.forEach(script => script.remove())

    // Add Blog schema
    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'VoidLance Blog',
      description: 'Thoughts on game development, creative coding, and indie game design',
      url: 'https://voidlance.blogspot.com',
      author: {
        '@type': 'Person',
        name: 'Alistair Sweeting'
      }
    }

    const blogSchemaScript = document.createElement('script')
    blogSchemaScript.type = 'application/ld+json'
    blogSchemaScript.setAttribute('data-blog-schema', 'true')
    blogSchemaScript.textContent = JSON.stringify(blogSchema)
    document.head.appendChild(blogSchemaScript)

    // Add ItemList schema with all posts
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: post.link,
        name: post.title,
        description: getPlainText(post.summary || post.content).substring(0, 160)
      }))
    }

    const itemListScript = document.createElement('script')
    itemListScript.type = 'application/ld+json'
    itemListScript.setAttribute('data-blog-schema', 'true')
    itemListScript.textContent = JSON.stringify(itemListSchema)
    document.head.appendChild(itemListScript)
  }

  const generateBlogPostSchema = (post) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: getPlainText(post.summary || post.content).substring(0, 160),
    datePublished: post.publishedISO,
    author: {
      '@type': 'Person',
      name: post.author || 'Alistair Sweeting'
    },
    url: post.link
  })

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-2xl sm:text-3xl md:text-4xl text-indie-accent-green text-center mb-4">Blog</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      <article className="text-indie-text-gray">
        <div className="bg-indie-bg-dark p-4 sm:p-5 md:p-6 rounded-lg border-2 border-indie-accent-green/50 mb-6">
          <h2 className="text-xl sm:text-2xl md:text-2xl text-indie-accent-green mb-3 sm:mb-4 text-center font-bold">VoidLance Blog</h2>
          <p className="text-center mb-4 text-indie-text-light text-sm sm:text-base md:text-lg">Read my latest thoughts, game development updates, and creative writing.</p>
          <div className="text-center">
            <a 
              href="https://voidlance.blogspot.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-indie-accent-green text-indie-bg-main px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base md:text-xl hover:bg-[#1cdba2] transition-colors shadow-indie"
            >
              Visit Full Blog →
            </a>
          </div>
        </div>
      </article>
      
      <div id="blog-posts">
        {loading && <p className="text-center italic text-sm sm:text-base">Loading blog posts...</p>}
        {error && (
          <p className="text-center text-indie-accent-pink text-sm sm:text-base">
            Unable to load blog posts. <a href="https://voidlance.blogspot.com" target="_blank" rel="noopener noreferrer">Visit the blog directly.</a>
          </p>
        )}
        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-sm sm:text-base">No posts found. <a href="https://voidlance.blogspot.com" target="_blank" className="text-indie-accent-green hover:underline">Visit the blog directly.</a></p>
        )}
        {posts.map((post, index) => {
          const preview = getPlainText(post.content).substring(0, 300)
          return (
            <article 
              key={index} 
              className="bg-indie-bg-dark p-4 sm:p-5 rounded-lg border border-indie-accent-green/30 hover:border-indie-accent-green/60 transition-colors mb-4 sm:mb-5 md:mb-6"
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              <script type="application/ld+json">
                {JSON.stringify(generateBlogPostSchema(post))}
              </script>
              
              <header className="mb-3">
                <h3 
                  className="text-lg sm:text-xl md:text-2xl text-indie-accent-green font-bold mb-2"
                  itemProp="headline"
                >
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#1cdba2] transition-colors"
                    itemProp="url"
                  >
                    {post.title}
                  </a>
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs sm:text-sm">
                  <time 
                    className="text-indie-accent-pink italic" 
                    dateTime={post.publishedISO}
                    itemProp="datePublished"
                  >
                    {post.published}
                  </time>
                  <span className="hidden sm:inline text-indie-accent-pink/60">•</span>
                  <span 
                    className="text-indie-accent-pink"
                    itemProp="author"
                    itemType="https://schema.org/Person"
                  >
                    By <span itemProp="name">{post.author}</span>
                  </span>
                </div>
              </header>
              
              <p 
                className="text-indie-text-gray mb-4 text-sm sm:text-base"
                itemProp="description"
              >
                {preview}{preview.length >= 300 ? '...' : ''}
              </p>
              
              <div className="hidden" itemProp="articleBody">
                {getPlainText(post.content)}
              </div>
              
              <footer>
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="text-indie-accent-green hover:underline font-bold text-sm sm:text-base hover:text-[#1cdba2] transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Read full post →
                </button>
              </footer>
            </article>
          )
        })}
      </div>
      
      {/* Modal rendered via portal to document.body for proper fixed positioning */}
      {selectedPost && createPortal(
        <div 
          className="fixed inset-0 z-50 animate-fadeIn"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflow: 'hidden'
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="glass-effect w-full max-w-4xl rounded-2xl border-2 border-indie-accent-green shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Close button */}
            <div className="sticky top-0 z-10 border-b-2 border-indie-accent-green/50 p-4 flex justify-between items-center flex-shrink-0" style={{ backgroundColor: 'var(--color-indie-bg-main)' }}>
              <h2 className="text-xl sm:text-2xl text-indie-accent-green font-bold flex-1 pr-4">
                {selectedPost.title}
              </h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-3xl text-indie-accent-green hover:text-indie-accent-pink transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-indie-accent-green/10"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            {/* Post metadata */}
            <div className="p-4 sm:p-6 border-b border-indie-accent-green/30 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs sm:text-sm">
                <time className="text-indie-accent-pink italic">
                  {selectedPost.published}
                </time>
                <span className="hidden sm:inline text-indie-accent-pink/60">•</span>
                <span className="text-indie-accent-pink">
                  By {selectedPost.author}
                </span>
                <span className="hidden sm:inline text-indie-accent-pink/60">•</span>
                <a 
                  href={selectedPost.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indie-accent-green hover:underline text-xs sm:text-sm"
                >
                  View on Blogger ↗
                </a>
              </div>
            </div>
            
            {/* Full post content */}
            <div 
              className="p-4 sm:p-6 text-indie-text-light prose prose-invert prose-lg max-w-none blog-post-content overflow-y-auto flex-1"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
          </div>
        </div>,
        document.body
      )}
    </PageWrapper>
  )
}
