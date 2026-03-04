import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | M2M Stock Intelligence',
  description: 'Privacy Policy for the M2M Stock Intelligence app.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0e17] text-[#E5E7EB] px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#6B7280] mb-8">Effective Date: March 1, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-[#9CA3AF]">
        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">1. Introduction</h2>
          <p>
            M2M Stock Intelligence (&quot;the App&quot;) is an educational stock analysis tool
            provided by Mark2Market LLC (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). This
            Privacy Policy explains what data we collect, how we use it, and your rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">2. Data We Collect</h2>
          <p>
            The only user-provided data the App processes is <strong className="text-[#E5E7EB]">stock ticker symbols</strong> that
            you enter to generate an analysis. We do not collect personal information, create user
            accounts, use cookies, or track analytics.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">3. How We Use Your Data</h2>
          <p>
            When you submit a ticker symbol, it is sent to our server and forwarded to third-party
            services solely to generate your analysis:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong className="text-[#E5E7EB]">Polygon.io</strong> &mdash; to retrieve real-time and historical stock market data</li>
            <li><strong className="text-[#E5E7EB]">OpenAI</strong> &mdash; to generate AI-powered analysis and pattern interpretation</li>
          </ul>
          <p className="mt-2">
            Ticker symbols are processed ephemerally and are not stored persistently on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">4. Data Storage &amp; Security</h2>
          <p>
            All data is transmitted over HTTPS. We do not maintain databases of user queries or
            analysis results. The App uses server-side rate limiting (by IP address) to prevent
            abuse; IP addresses are held in memory only and are not logged or stored.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">5. Third-Party Services</h2>
          <p>
            The App relies on the following third-party services, each governed by their own privacy
            policies:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Polygon.io &mdash; <a href="https://polygon.io/privacy" className="text-[#00E59B] underline" target="_blank" rel="noopener noreferrer">polygon.io/privacy</a></li>
            <li>OpenAI &mdash; <a href="https://openai.com/privacy" className="text-[#00E59B] underline" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">6. Cookies &amp; Tracking</h2>
          <p>
            The App does not use cookies, local storage for tracking purposes, or any third-party
            analytics or advertising services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">7. Children&apos;s Privacy</h2>
          <p>
            The App is not directed at children under the age of 13. We do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be reflected by
            updating the effective date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:support@mark2markets.com" className="text-[#00E59B] underline">
              support@mark2markets.com
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-[#1f2937] text-xs text-[#6B7280]">
        &copy; {new Date().getFullYear()} Mark2Market LLC. All rights reserved.
      </div>
    </main>
  );
}
