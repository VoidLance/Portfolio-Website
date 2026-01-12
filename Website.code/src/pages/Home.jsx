import React from 'react'
import PageWrapper from '../components/PageWrapper'
import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <div className="w-full max-w-[95%] mx-auto px-2 lg:px-4" style={{ marginTop: '2rem' }}>
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
        <main 
          className="w-full lg:w-[78%] glass-effect p-5 rounded-xl mb-5 shadow-indie border-2 border-indie-accent-green min-w-0 order-1 lg:order-2"
          role="main"
        >
          <h2 className="text-4xl text-indie-accent-green text-center mb-4">Welcome to my website!</h2>
          <hr className="border-0 border-t border-indie-accent-green/50 my-2.5" />
          
          <article className="text-indie-text-gray">
            <p>
              Hi, I'm <strong className="text-indie-accent-green font-bold">Alistair Sweeting</strong>, and welcome to my website! 
              It is still heavily under construction, but eventually it should serve as my central page, as an alternative to social media, 
              for showing off both my personality and my portfolio of games, software, 3D models and writing.
            </p>
            
            <p className="mt-4">
              I'm also working on a gemini page for people who use gemini, but due to the more restricted access nature of gemini, 
              this will be my main page from now on - and gemini will be a secondary page for closer friends and people I can show 
              how to use a gemini browser. For those interested, my gemini page will be available at:{' '}
              <a 
                href="gemini://voidlance.cities.yesterweb.org/" 
                rel="external"
              >
                gemini://voidlance.cities.yesterweb.org/
              </a>
            </p>
            
            <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
            
            <section aria-labelledby="photography-section">
              <h3 id="photography-section" className="sr-only">Photography Portfolio</h3>
              <p>
                You can find my photography here:<br />
                <a 
                  href="https://www.viewbug.com/member/AlistairSweeting/cover" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indie-accent-green font-bold no-underline hover:text-[#1cdba2] hover:underline hover:decoration-indie-accent-pink hover:decoration-dashed transition-all"
                >
                  Alistair Sweeting Photography
                </a>{' '}
                |{' '}
                <a 
                  href="https://alistairsweeting.viewbug.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indie-accent-green font-bold no-underline hover:text-[#1cdba2] hover:underline hover:decoration-indie-accent-pink hover:decoration-dashed transition-all"
                >
                  Photography Website
                </a>
              </p>
            </section>
            
            <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
            
            <section aria-labelledby="github-section">
              <h3 id="github-section" className="sr-only">GitHub Profile</h3>
              <p>
                You can also find my github{' '}
                <a 
                  href="https://github.com/VoidLance" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indie-accent-green font-bold no-underline hover:text-[#1cdba2] hover:underline hover:decoration-indie-accent-pink hover:decoration-dashed transition-all"
                >
                  here.
                </a>{' '}
                This website's source code is also available there in a private repository, and I am using the neocities git integration to
                automatically push updates when I make changes. It's pretty cool! I am also considering open-sourcing it in the future, but there's a whole thing with licensing 
                that I need to figure out first, I'm happy to make the website itself an open license, but some of the things I'm putting here have their own licensing 
                and I don't know whether or how making the code available would impact that.
              </p>
            </section>
            
            <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
            
            <div className="flex justify-center mt-4">
              <a href="https://vampire-club.neocities.org/" target="_blank" rel="noopener noreferrer" aria-label="Vampire Club member">
                <img src="/Images/vcskull.gif" className="w-fit h-auto" alt="Vampire Club skull banner - I'm a member!" loading="lazy" />
              </a>
            </div>
          </article>
        </main>

        <Sidebar />
      </div>
    </div>
  )
}
