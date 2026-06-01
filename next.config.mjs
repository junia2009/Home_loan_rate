/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Service Worker は public/sw.js を手動登録（next-pwa 非依存で安定動作）
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
