// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React from 'react'
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

            <hr className="border-0 border-t border-indie-accent-green/50 my-4" />

            <section aria-labelledby="stack-architecture-section">
              <h3
                id="stack-architecture-section"
                className="text-xl sm:text-2xl text-indie-accent-green font-bold mb-2"
              >
                Website Stack and AWS Architecture
              </h3>
              <p className="mb-4">
                This visual map shows how the frontend, deployment tooling, and AWS platform services connect from local development to production delivery.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="glass-dark rounded-lg p-3 border border-indie-accent-green/35">
                  <h4 className="text-indie-accent-green font-semibold text-sm uppercase tracking-wide mb-2">Languages</h4>
                  <p className="text-sm text-indie-text-light">JavaScript (React), HTML, CSS, JSON, YAML (AWS SAM templates)</p>
                </div>
                <div className="glass-dark rounded-lg p-3 border border-indie-accent-green/35">
                  <h4 className="text-indie-accent-green font-semibold text-sm uppercase tracking-wide mb-2">Core Stack and Tools</h4>
                  <p className="text-sm text-indie-text-light">React + React Router, Vite, Tailwind CSS, Node.js, npm scripts, AWS CLI/SAM CLI, GitHub</p>
                </div>
              </div>

              <div className="glass-dark rounded-lg p-3 sm:p-4 border border-indie-accent-green/35 overflow-x-auto">
                <svg
                  viewBox="0 0 1080 500"
                  className="w-full h-auto min-w-[760px]"
                  role="img"
                  aria-label="Architecture diagram showing React build and deployment on AWS"
                >
                  <defs>
                    <marker id="arrow-head" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#43ea7c" />
                    </marker>
                  </defs>

                  <rect x="40" y="70" width="220" height="92" rx="12" fill="#241445" stroke="#43ea7c" strokeWidth="2" />
                  <text x="150" y="102" textAnchor="middle" fill="#fceaff" fontSize="18" fontWeight="700">Local Codebase</text>
                  <text x="150" y="128" textAnchor="middle" fill="#e6e6e6" fontSize="14">React, JSX, Tailwind</text>
                  <text x="150" y="146" textAnchor="middle" fill="#e6e6e6" fontSize="14">Frontend + Helpdesk UI</text>

                  <rect x="330" y="70" width="210" height="92" rx="12" fill="#241445" stroke="#43ea7c" strokeWidth="2" />
                  <text x="435" y="102" textAnchor="middle" fill="#fceaff" fontSize="18" fontWeight="700">Build Pipeline</text>
                  <text x="435" y="128" textAnchor="middle" fill="#e6e6e6" fontSize="14">npm run build</text>
                  <text x="435" y="146" textAnchor="middle" fill="#e6e6e6" fontSize="14">Vite to dist/</text>

                  <rect x="610" y="70" width="210" height="92" rx="12" fill="#241445" stroke="#43ea7c" strokeWidth="2" />
                  <text x="715" y="102" textAnchor="middle" fill="#fceaff" fontSize="18" fontWeight="700">S3 Bucket</text>
                  <text x="715" y="128" textAnchor="middle" fill="#e6e6e6" fontSize="14">Static assets</text>
                  <text x="715" y="146" textAnchor="middle" fill="#e6e6e6" fontSize="14">index + /assets + media</text>

                  <rect x="880" y="70" width="170" height="92" rx="12" fill="#241445" stroke="#43ea7c" strokeWidth="2" />
                  <text x="965" y="102" textAnchor="middle" fill="#fceaff" fontSize="18" fontWeight="700">CloudFront</text>
                  <text x="965" y="128" textAnchor="middle" fill="#e6e6e6" fontSize="14">Global CDN</text>
                  <text x="965" y="146" textAnchor="middle" fill="#e6e6e6" fontSize="14">HTTPS delivery</text>

                  <rect x="450" y="250" width="250" height="86" rx="12" fill="#13092d" stroke="#ed64f5" strokeWidth="2" />
                  <text x="575" y="280" textAnchor="middle" fill="#fceaff" fontSize="17" fontWeight="700">Deploy Tooling</text>
                  <text x="575" y="304" textAnchor="middle" fill="#e6e6e6" fontSize="14">npm run deploy:s3</text>
                  <text x="575" y="322" textAnchor="middle" fill="#e6e6e6" fontSize="14">AWS CLI + CloudFront invalidation</text>

                  <rect x="40" y="370" width="280" height="92" rx="12" fill="#13092d" stroke="#ed64f5" strokeWidth="2" />
                  <text x="180" y="398" textAnchor="middle" fill="#fceaff" fontSize="17" fontWeight="700">Helpdesk AWS Backend</text>
                  <text x="180" y="420" textAnchor="middle" fill="#e6e6e6" fontSize="14">API Gateway + Lambda</text>
                  <text x="180" y="438" textAnchor="middle" fill="#e6e6e6" fontSize="14">DynamoDB + Cognito + SES</text>

                  <rect x="370" y="370" width="220" height="92" rx="12" fill="#13092d" stroke="#ed64f5" strokeWidth="2" />
                  <text x="480" y="398" textAnchor="middle" fill="#fceaff" fontSize="17" fontWeight="700">Platform Services</text>
                  <text x="480" y="420" textAnchor="middle" fill="#e6e6e6" fontSize="14">Route 53 + ACM (DNS/HTTPS)</text>
                  <text x="480" y="438" textAnchor="middle" fill="#e6e6e6" fontSize="14">CloudWatch monitoring</text>

                  <line x1="260" y1="116" x2="330" y2="116" stroke="#43ea7c" strokeWidth="3" markerEnd="url(#arrow-head)" />
                  <line x1="540" y1="116" x2="610" y2="116" stroke="#43ea7c" strokeWidth="3" markerEnd="url(#arrow-head)" />
                  <line x1="820" y1="116" x2="880" y2="116" stroke="#43ea7c" strokeWidth="3" markerEnd="url(#arrow-head)" />
                  <line x1="435" y1="162" x2="520" y2="250" stroke="#43ea7c" strokeWidth="3" markerEnd="url(#arrow-head)" />
                  <line x1="620" y1="250" x2="690" y2="162" stroke="#43ea7c" strokeWidth="3" markerEnd="url(#arrow-head)" />
                  <line x1="220" y1="370" x2="220" y2="162" stroke="#ed64f5" strokeWidth="3" markerEnd="url(#arrow-head)" />
                  <line x1="480" y1="370" x2="230" y2="162" stroke="#ed64f5" strokeWidth="3" markerEnd="url(#arrow-head)" />
                  <line x1="320" y1="416" x2="370" y2="416" stroke="#ed64f5" strokeWidth="3" markerEnd="url(#arrow-head)" />

                  <text x="540" y="492" textAnchor="middle" fill="#e6e6e6" fontSize="13">
                    Main website path: Local - Build - Deploy - S3 - CloudFront - Visitors
                  </text>
                </svg>
              </div>
              <p className="text-xs sm:text-sm mt-2 text-indie-text-gray">
                On smaller screens, drag horizontally to view the full architecture map.
              </p>

              <div className="mt-4 space-y-4">
                <div className="glass-dark rounded-lg p-3 sm:p-4 border border-indie-accent-green/35">
                  <h4 className="text-indie-accent-green font-semibold mb-2">How It All Works Together</h4>
                  <p className="text-sm sm:text-base text-indie-text-light leading-relaxed">
                    Development starts in this React codebase, where pages and shared components are authored with JavaScript, JSX,
                    and Tailwind styles. Vite bundles everything into an optimized dist output for static hosting. Deployment uploads
                    that output to S3, then CloudFront serves it globally over HTTPS with cache invalidation when updates are pushed.
                    DNS and certificates are managed by Route 53 and ACM, while dynamic support features are handled by the AWS helpdesk
                    backend stack (API Gateway, Lambda, DynamoDB, Cognito, and SES).
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="glass-dark rounded-lg p-3 sm:p-4 border border-indie-accent-green/35">
                    <h4 className="text-indie-accent-green font-semibold mb-2">Benefits</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-indie-text-light">
                      <li>Fast global delivery from CloudFront with low hosting cost for static assets.</li>
                      <li>Clear separation between frontend UI and backend services, improving maintainability.</li>
                      <li>Reliable AWS primitives for support workflows (auth, email, API, and ticket storage).</li>
                      <li>Simple release flow: build once, deploy static output, invalidate cache, go live quickly.</li>
                    </ul>
                  </div>

                  <div className="glass-dark rounded-lg p-3 sm:p-4 border border-indie-accent-pink/45">
                    <h4 className="text-indie-accent-pink font-semibold mb-2">Drawbacks / Trade-offs</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-indie-text-light">
                      <li>Architecture spans multiple services, so setup and troubleshooting can be more complex.</li>
                      <li>Static SPA hosting on S3 + CloudFront needs routing and cache behavior handled carefully.</li>
                      <li>Deployment and environment configuration are more involved than a single all-in-one platform.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </main>

        <Sidebar />
      </div>
    </div>
  )
}
