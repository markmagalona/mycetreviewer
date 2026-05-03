// src/app/privacy/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — MyCETReviewer',
  description: 'How MyCETReviewer collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Home</Link>
          <span className="font-black text-gray-900">MyCET<span className="text-red-600">Reviewer</span></span>
          <div/>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">1. Who we are</h2>
            <p>MyCETReviewer ("we", "us", "our") is an online college entrance exam review platform for Filipino students. We are based in the Philippines. You can reach us at <a href="mailto:hello@mycetreviewer.com" className="text-red-600 hover:underline">hello@mycetreviewer.com</a>.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">2. What we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account information:</strong> email address, username, and the admission tests you are preparing for.</li>
              <li><strong>Exam data:</strong> your answers, scores, and session timestamps — used to personalize your study plan.</li>
              <li><strong>Payment information:</strong> your GCash or Instapay account name and reference number for manual payment verification. We do not collect card numbers or bank account details.</li>
              <li><strong>Payment screenshot:</strong> an optional screenshot of your payment proof, stored securely in our database.</li>
              <li><strong>Usage data:</strong> pages visited, features used, and device/browser type for analytics and improvement.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve the review platform</li>
              <li>To personalize your study plan and track your progress</li>
              <li>To verify payments and activate your account</li>
              <li>To send important account updates (not marketing spam)</li>
              <li>To analyze usage patterns and fix bugs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">4. Who we share data with</h2>
            <p className="mb-2">We do not sell your data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — our database and storage provider (servers in the US)</li>
              <li><strong>Vercel</strong> — our hosting provider</li>
              <li><strong>Google (Gemini) and OpenAI</strong> — for AI question generation. We send only subject/topic metadata, never personal data.</li>
              <li><strong>Meta (Facebook)</strong> — anonymized conversion events for advertising measurement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">5. Data retention</h2>
            <p>We retain your account data as long as your account is active. You may request deletion at any time by emailing <a href="mailto:hello@mycetreviewer.com" className="text-red-600 hover:underline">hello@mycetreviewer.com</a>. Payment records are kept for 3 years for legal compliance.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">6. Cookies and tracking</h2>
            <p>We use cookies for session management and analytics. We use Meta Pixel to measure advertising effectiveness. You can disable cookies in your browser settings, though this may affect functionality.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">7. Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Email us at <a href="mailto:hello@mycetreviewer.com" className="text-red-600 hover:underline">hello@mycetreviewer.com</a> for any requests. We will respond within 7 days.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">8. Security</h2>
            <p>We use HTTPS encryption, secure database access controls, and private storage buckets to protect your data. No system is 100% secure — please use a strong password and keep your account credentials private.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">9. Children</h2>
            <p>MyCETReviewer is intended for senior high school and college-age students. Users under 13 must have parental consent. We do not knowingly collect data from children under 13.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">10. Changes</h2>
            <p>We may update this policy occasionally. We will notify registered users by email for significant changes. Continued use of the platform means you accept the updated policy.</p>
          </section>

          <section>
            <h2 className="text-base font-black text-gray-900 mb-2">11. Contact</h2>
            <p>Questions about this policy? Email <a href="mailto:hello@mycetreviewer.com" className="text-red-600 hover:underline">hello@mycetreviewer.com</a> or use our <Link href="/contact" className="text-red-600 hover:underline">contact form</Link>.</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4 text-xs text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">Terms of Use</Link>
          <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          <Link href="/" className="hover:text-gray-600">Home</Link>
        </div>
      </div>
    </div>
  )
}
