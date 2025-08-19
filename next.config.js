/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['open.api.nexon.com'],
  },
  // React의 strict mode 비활성화 (hydration 오류 완화)
  reactStrictMode: false,
}

module.exports = nextConfig