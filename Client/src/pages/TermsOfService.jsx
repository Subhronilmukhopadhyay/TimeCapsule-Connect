import React from 'react';

const TermsOfService = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TimeCapsule Connect</h1>
          <a href="/" className="text-indigo-500 hover:underline">Back to Home</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Terms of Service</h2>

        <p className="mb-4">Effective Date: <strong>July 19, 2025</strong></p>

        <p className="mb-4">
          By accessing or using TimeCapsule Connect, you agree to be bound by these Terms of Service.
          Please read them carefully.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">1. Acceptance of Terms</h3>
        <p className="mb-4">
          By using the platform, you acknowledge that you have read, understood, and agree to comply with these terms.
          If you do not agree, please do not use the service.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">2. Eligibility</h3>
        <p className="mb-4">
          You must be at least 13 years old to use this service. If you're under 18, you must have parental consent.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">3. User Responsibilities</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>You must not upload content that violates any laws or rights of others.</li>
          <li>All capsules should be respectful, appropriate, and non-malicious.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">4. Intellectual Property</h3>
        <p className="mb-4">
          You retain full ownership of the content you upload. By using our service, you grant us a limited license to
          store and process your content solely to deliver our service.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">5. Account Termination</h3>
        <p className="mb-4">
          We reserve the right to suspend or delete accounts that violate these terms or harm the platform or its users.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">6. Changes to Terms</h3>
        <p className="mb-4">
          We may update these terms at any time. We'll notify users of major changes via email or platform notifications.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">7. Disclaimer</h3>
        <p className="mb-4">
          TimeCapsule Connect is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free access.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">8. Governing Law</h3>
        <p className="mb-4">
          These terms are governed by the laws of your jurisdiction unless otherwise required by applicable law.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">9. Contact</h3>
        <p>
          For questions about these terms, please contact us at:
          <a href="mailto:support@timecapsuleconnect.com" className="text-indigo-600 hover:underline">
            support@timecapsuleconnect.com
          </a>
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

export default TermsOfService;