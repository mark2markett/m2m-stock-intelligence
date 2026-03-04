import type { Metadata } from 'next';
import { BarChart3, Mail, HelpCircle, FileText, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support | M2M Stock Intelligence',
  description: 'Get help with the M2M Stock Intelligence app.',
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0a0e17] text-[#E5E7EB] px-4 py-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-[#00E59B]/10 rounded-lg">
          <BarChart3 className="h-7 w-7 text-[#00E59B]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Support</h1>
          <p className="text-sm text-[#6B7280]">M2M Stock Intelligence</p>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-[#00E59B]" />
          <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111827] rounded-xl p-5 border border-[#1f2937]">
            <h3 className="font-semibold text-[#E5E7EB] mb-2">How long does an analysis take?</h3>
            <p className="text-sm text-[#9CA3AF]">
              A full analysis typically completes in 10&ndash;20 seconds. The app retrieves
              historical price data, calculates 15+ technical indicators, analyzes news sentiment,
              and generates an AI-powered summary.
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl p-5 border border-[#1f2937]">
            <h3 className="font-semibold text-[#E5E7EB] mb-2">Which stocks are supported?</h3>
            <p className="text-sm text-[#9CA3AF]">
              The app supports US-listed stocks with standard 1&ndash;5 letter ticker symbols
              (e.g., AAPL, MSFT, TSLA). ETFs and international tickers are not currently supported.
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl p-5 border border-[#1f2937]">
            <h3 className="font-semibold text-[#E5E7EB] mb-2">Is this investment advice?</h3>
            <p className="text-sm text-[#9CA3AF]">
              No. M2M Stock Intelligence is strictly an educational tool. All analysis, scores, and
              observations are for learning purposes only. Always conduct your own research and
              consult a qualified financial advisor before making investment decisions.
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl p-5 border border-[#1f2937]">
            <h3 className="font-semibold text-[#E5E7EB] mb-2">Why am I seeing a rate limit error?</h3>
            <p className="text-sm text-[#9CA3AF]">
              To ensure fair access, the app limits requests to 5 analyses per minute. Wait a moment
              and try again.
            </p>
          </div>

          <div className="bg-[#111827] rounded-xl p-5 border border-[#1f2937]">
            <h3 className="font-semibold text-[#E5E7EB] mb-2">Can I export my analysis?</h3>
            <p className="text-sm text-[#9CA3AF]">
              Yes. After generating an analysis, use the &quot;Export PDF&quot; button to download a
              comprehensive report including all charts, indicators, and the AI summary.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-[#00E59B]" />
          <h2 className="text-xl font-semibold text-white">Contact Us</h2>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border border-[#1f2937]">
          <p className="text-sm text-[#9CA3AF] mb-3">
            Have a question, found a bug, or want to provide feedback? We&apos;d love to hear from
            you.
          </p>
          <a
            href="mailto:support@mark2markets.com"
            className="inline-flex items-center gap-2 text-[#00E59B] hover:underline text-sm font-medium"
          >
            <Mail className="h-4 w-4" />
            support@mark2markets.com
          </a>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-[#00E59B]" />
          <h2 className="text-xl font-semibold text-white">Legal</h2>
        </div>
        <div className="flex gap-4">
          <a
            href="/privacy"
            className="flex items-center gap-2 bg-[#111827] rounded-xl px-5 py-3 border border-[#1f2937] text-sm text-[#9CA3AF] hover:text-[#00E59B] transition-colors"
          >
            <Shield className="h-4 w-4" />
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="flex items-center gap-2 bg-[#111827] rounded-xl px-5 py-3 border border-[#1f2937] text-sm text-[#9CA3AF] hover:text-[#00E59B] transition-colors"
          >
            <FileText className="h-4 w-4" />
            Terms of Service
          </a>
        </div>
      </section>

      <div className="mt-12 pt-6 border-t border-[#1f2937] text-xs text-[#6B7280]">
        &copy; {new Date().getFullYear()} Mark2Market LLC. All rights reserved.
      </div>
    </main>
  );
}
