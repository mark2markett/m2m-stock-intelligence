import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | M2M Stock Intelligence',
  description: 'Terms of Service for the M2M Stock Intelligence app.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0e17] text-[#E5E7EB] px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-sm text-[#6B7280] mb-8">Effective Date: March 1, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-[#9CA3AF]">
        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">1. Acceptance of Terms</h2>
          <p>
            By using M2M Stock Intelligence (&quot;the App&quot;), you agree to these Terms of
            Service. If you do not agree, do not use the App.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">2. Educational Disclaimer</h2>
          <p>
            The App is an <strong className="text-[#E5E7EB]">educational tool only</strong>. All
            analysis, scores, ratings, and observations are for educational and informational
            purposes. Nothing in this App constitutes investment advice, a recommendation to buy or
            sell any security, or a solicitation of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">3. No Warranty</h2>
          <p>
            The App and all data, analysis, and content are provided &quot;as is&quot; and &quot;as
            available&quot; without warranty of any kind, express or implied. We do not guarantee
            the accuracy, completeness, timeliness, or reliability of any information displayed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">4. Risk Acknowledgment</h2>
          <p>
            Trading and investing in securities involves substantial risk of loss. You acknowledge
            that you are solely responsible for your investment decisions and that you should conduct
            your own independent research before making any financial decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Use automated systems, bots, or scrapers to access the App</li>
            <li>Redistribute, resell, or republish any analysis or data from the App</li>
            <li>Attempt to circumvent rate limits or security measures</li>
            <li>Use the App for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">6. Third-Party Data</h2>
          <p>
            The App incorporates data from third-party providers including Polygon.io and OpenAI.
            This data is subject to those providers&apos; respective terms of service and usage
            policies. We are not responsible for the accuracy or availability of third-party data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Mark2Market LLC and its officers, directors, and
            employees shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages, or any loss of profits or revenues, whether incurred directly or
            indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from
            your use of the App.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">8. Modifications</h2>
          <p>
            We reserve the right to modify these Terms at any time. Continued use of the App after
            changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State
            of New York, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#E5E7EB] mb-2">10. Contact Us</h2>
          <p>
            If you have questions about these Terms, contact us at{' '}
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
