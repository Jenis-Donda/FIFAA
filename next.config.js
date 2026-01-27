/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "digitalhub.fifa.com",
        pathname: "/transform/**",
      },
      {
        protocol: "https",
        hostname: "api.fifa.com",
        pathname: "/api/v3/picture/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
