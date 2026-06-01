/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig = {
  output: 'export',       // 完全な静的HTML生成（GitHub Pages 用）
  trailingSlash: true,    // /simulation/ 形式でファイルを出力
  basePath,               // 本番: /Home_loan_rate, ローカル: ''
  reactStrictMode: true,
};

export default nextConfig;
