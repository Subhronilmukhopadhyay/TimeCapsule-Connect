import React from 'react';

const SecurityPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TimeCapsule Connect</h1>
          <a href="/" className="text-indigo-500 hover:underline">Back to Home</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Information Security</h2>
        <p className="mb-4">Last Updated: <strong>July 19, 2025</strong></p>

        <p className="mb-6">
          At TimeCapsule Connect, safeguarding your data is our highest priority. Below is a summary of the security
          measures, practices, and tools we’ve implemented to protect your information and ensure privacy by design.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">1. Data Encryption</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>All data in transit is secured using <strong>HTTPS (TLS 1.2+)</strong>.</li>
          <li>Sensitive user data is encrypted at rest using AES-256 where applicable.</li>
          <li>JWT tokens are signed with secure, rotating secrets.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">2. Authentication & Authorization</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>Secure login system using hashed passwords (bcrypt).</li>
          <li>Token-based access control with automatic expiration.</li>
          <li>Rate limiting, account lockout, and bot protection mechanisms in place.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">3. Content & Input Security</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>All user inputs are validated and sanitized using <code>express-validator</code> and <code>DOMPurify</code>.</li>
          <li>Protection against XSS, CSRF, and injection attacks.</li>
          <li>Cookies are set with <code>HttpOnly</code>, <code>SameSite</code>, and <code>Secure</code> attributes.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">4. Server & API Protection</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>Hardened Express server using <code>helmet()</code> middleware.</li>
          <li>Cross-Origin Resource Sharing (CORS) configured for controlled access.</li>
          <li>Strict Content Security Policy (CSP) and prevention of clickjacking using frameguard.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">5. Resilience & Monitoring</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>Automated rate limiting and IP-based throttling to prevent abuse.</li>
          <li>System logs and user actions are monitored for anomalies and breaches.</li>
          <li>Uptime and health checks in place for infrastructure stability.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">6. Data Access & Privacy</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>Only authorized personnel can access user data — audited and logged.</li>
          <li>User content is not used for training, marketing, or profiling without explicit consent.</li>
          <li>You can delete or export your capsule data at any time.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">7. Responsible Disclosure</h3>
        <p className="mb-4">
          If you discover a vulnerability, please report it responsibly at
          <a href="mailto:security@timecapsuleconnect.com" className="text-indigo-600 hover:underline"> security@timecapsuleconnect.com</a>.
          We appreciate ethical disclosure and take all reports seriously.
        </p>
      </main>

      <footer className="bg-white shadow-md mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-sm text-center text-gray-500">
          &copy; 2025 TimeCapsule Connect. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default SecurityPage;