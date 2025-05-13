"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'benefits', 'use-cases', 'installation', 'pricing', 'faq'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Menu */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                Chat App
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'benefits', 'use-cases', 'installation', 'pricing', 'faq'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    activeSection === section
                      ? 'text-violet-600'
                      : 'text-gray-600 hover:text-violet-600'
                  }`}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
              <Link
                href="/chat"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Try Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['home', 'benefits', 'use-cases', 'installation', 'pricing', 'faq'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    activeSection === section
                      ? 'text-violet-600 bg-violet-50'
                      : 'text-gray-600 hover:text-violet-600 hover:bg-gray-50'
                  }`}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
              <Link
                href="/chat"
                className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-violet-600 hover:bg-violet-700"
              >
                Try Now
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Customer Support with{' '}
              <span className="bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                AI-Powered Chat
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Enhance your customer experience with our intelligent chat solution. 
              Provide instant support, automate responses, and scale your business efficiently.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Get Started
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Watch Demo
              </a>
            </div>
          </div>
          
          {/* Demo Video */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-xl">
              <video
                className="w-full h-full object-cover"
                poster="/demo-poster.jpg"
                controls
              >
                <source src="/demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Our Chat Solution?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Experience the power of AI-driven customer support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Learning */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/benefits/learning.svg"
                  alt="Learning"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Smart Learning
              </h3>
              <p className="text-gray-600">
                Our AI continuously learns from interactions to provide better responses and improve customer satisfaction.
              </p>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/benefits/support.svg"
                  alt="Support"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Provide instant support to your customers anytime, anywhere, with automated responses and human handoff.
              </p>
            </div>

            {/* Customization */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/benefits/customization.svg"
                  alt="Customization"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Easy Customization
              </h3>
              <p className="text-gray-600">
                Customize the chat interface, responses, and behavior to match your brand and business needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Perfect for Various Use Cases
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              From education to customer support, our chat solution adapts to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Courses */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/use-cases/courses.svg"
                  alt="Courses"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Online Courses
              </h3>
              <p className="text-gray-600">
                Provide instant answers to student questions and automate course-related support.
              </p>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/use-cases/support.svg"
                  alt="Support"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Customer Support
              </h3>
              <p className="text-gray-600">
                Handle common customer inquiries and provide instant support for your products and services.
              </p>
            </div>

            {/* Consulting */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/use-cases/consulting.svg"
                  alt="Consulting"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Business Consulting
              </h3>
              <p className="text-gray-600">
                Automate initial consultations and provide quick answers to common business questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section id="installation" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Easy Installation
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Get started in minutes with our simple setup process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/installation/copy.svg"
                  alt="Copy"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Copy the Code
              </h3>
              <p className="text-gray-600">
                Copy our ready-to-use chat widget code snippet.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/installation/paste.svg"
                  alt="Paste"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Paste in Your Site
              </h3>
              <p className="text-gray-600">
                Add the code to your website's HTML, just before the closing body tag.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-12 h-12 mb-6">
                <Image
                  src="/installation/ready.svg"
                  alt="Ready"
                  width={48}
                  height={48}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Go!
              </h3>
              <p className="text-gray-600">
                Your chat widget is now live and ready to assist your customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Choose the plan that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <p className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-600">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic chat widget
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 100 messages/month
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic customization
                </li>
              </ul>
              <Link
                href="/chat"
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-violet-500">
              <div className="absolute top-0 right-0 -mt-4 -mr-4">
                <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-violet-500 text-white">
                  Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
              <p className="text-4xl font-bold text-gray-900 mb-6">$29<span className="text-lg text-gray-600">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited messages
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced customization
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <Link
                href="/chat"
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Get Started
              </Link>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Business</h3>
              <p className="text-4xl font-bold text-gray-900 mb-6">$99<span className="text-lg text-gray-600">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Pro
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom AI training
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  API access
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <Link
                href="/chat"
                className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Find answers to common questions about our chat solution
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {/* FAQ Item 1 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How does the AI chat work?
                </h3>
                <p className="text-gray-600">
                  Our AI chat uses advanced natural language processing to understand and respond to customer queries. It learns from interactions to provide more accurate and helpful responses over time.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I customize the chat widget?
                </h3>
                <p className="text-gray-600">
                  Yes! You can customize the appearance, behavior, and responses of the chat widget to match your brand and business needs. Our Pro and Business plans offer advanced customization options.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a limit to the number of messages?
                </h3>
                <p className="text-gray-600">
                  The Free plan includes up to 100 messages per month. Pro and Business plans offer unlimited messages to handle all your customer interactions.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I get started?
                </h3>
                <p className="text-gray-600">
                  Getting started is easy! Simply sign up for a plan, copy the provided code snippet, and paste it into your website. The chat widget will be live and ready to use in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Chat App</h3>
              <p className="text-gray-400">
                Transform your customer support with AI-powered chat solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#home" className="text-gray-400 hover:text-white">Home</a>
                </li>
                <li>
                  <a href="#benefits" className="text-gray-400 hover:text-white">Benefits</a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white">FAQ</a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">API Reference</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">Support</a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-400 mb-4">
                Subscribe to our newsletter for the latest updates and features.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-r-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Chat App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
