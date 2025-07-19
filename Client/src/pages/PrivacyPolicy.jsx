import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">TimeCapsule Connect</h1>
          <a href="/" className="text-indigo-500 hover:underline">Back to Home</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold text-gray-900 mb-6">Privacy Policy</h2>

        <p className="mb-4">Effective Date: <strong>July 19, 2025</strong></p>

        <p className="mb-4">
          At <strong>TimeCapsule Connect</strong>, we respect your privacy and are committed to protecting your personal data.
          This Privacy Policy describes how we collect, use, and protect your information when you use our platform.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">1. Information We Collect</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>Personal identifiers: Name, email address, login credentials.</li>
          <li>Capsule content: Text, images, and media you upload.</li>
          <li>Usage data: IP address, browser type, session logs.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">2. How We Use Your Data</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>To provide and personalize your experience.</li>
          <li>To ensure data integrity and secure access.</li>
          <li>To analyze usage trends and improve the platform.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">3. Data Sharing</h3>
        <p className="mb-4">
          We do not sell your data. We only share information with trusted service providers who help us operate the service,
          or when legally required.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">4. Your Rights</h3>
        <ul className="list-disc ml-6 mb-4 space-y-1">
          <li>Request access to your data.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Withdraw consent for data use at any time.</li>
        </ul>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">5. Security</h3>
        <p className="mb-4">
          We implement encryption, access control, and data sanitization to protect your information. While no system is 100% secure,
          we strive to use best practices across the board.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">6. Changes to This Policy</h3>
        <p className="mb-4">
          We may update this policy periodically. We’ll notify you via email or in-app notifications whenever major changes occur.
        </p>

        <h3 className="text-2xl font-semibold text-indigo-600 mt-8 mb-2">7. Contact Us</h3>
        <p>
          Have questions? Contact us at:
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

export default PrivacyPolicy;