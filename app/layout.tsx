import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: '住宅ローン金利ナビ | 変動金利を一覧で比較',
  description:
    '各銀行の住宅ローン変動金利を一覧で比較。借入額・期間を入れて月々の返済額をシミュレーションできます。',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '金利ナビ',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ServiceWorkerRegister />
        <div className="min-h-screen flex flex-col">
          <header className="bg-brand-600 text-white shadow">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <span aria-hidden>🏠</span>
                <span>住宅ローン金利ナビ</span>
              </Link>
              <nav className="text-sm flex gap-4">
                <Link href="/" className="hover:underline">
                  金利一覧
                </Link>
                <Link href="/simulation" className="hover:underline">
                  シミュレーション
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
            {children}
          </main>

          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500 space-y-2">
              <p>
                ※ 本サイトの金利・条件は参考情報です。最新かつ正確な情報は必ず各銀行の公式サイトでご確認ください。
              </p>
              <p className="flex gap-4">
                <Link href="/disclaimer" className="hover:underline">
                  免責事項
                </Link>
                <span>© {new Date().getFullYear()} 住宅ローン金利ナビ</span>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
