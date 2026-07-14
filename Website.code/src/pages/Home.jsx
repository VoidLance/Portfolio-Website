// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
import PageWrapper from '../components/PageWrapper'
import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <div className="w-full max-w-[95%] mx-auto px-2 lg:px-4" style={{ marginTop: '2rem' }}>
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
        <main
          className="w-full lg:w-[78%] glass-effect p-4 sm:p-5 rounded-xl mb-5 shadow-indie border-2 border-indie-accent-green min-w-0 order-1 lg:order-2"
          role="main"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-indie-accent-green text-center mb-4">Welcome to my website!</h2>
          <hr className="border-0 border-t border-indie-accent-green/50 my-2.5" />

          <article className="text-indie-text-gray text-sm sm:text-base md:text-lg leading-relaxed">
            <p>
              Hi, I'm <strong className="text-indie-accent-green font-bold">Alistair Sweeting</strong>, and welcome to my website!
              It is still heavily under construction, but eventually it should serve as my central page, as an alternative to social media,
              for showing off both my personality and my portfolio of games, software, 3D models and writing.
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
                This website's source code is also available there in a public repository. The live site is deployed from this project to AWS S3 + CloudFront. Not all of the content on the website is licensed the same way, some of it is copyrighted by me and some of it may use other licenses.
              </p>
            </section>
          </article>
        </main>

        <Sidebar />
      </div>
    </div>
  )
}
