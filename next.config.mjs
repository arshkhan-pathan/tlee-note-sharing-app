/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Requests to /api/* will be rewritten
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/:path*" // Proxy to FastAPI backend
            : "/api/:path*", // Ensure it works in production
      },
    ];
  },
};

export default nextConfig;
