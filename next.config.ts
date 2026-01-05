// next.config.ts
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  api: {
    bodyParser: {
      sizeLimit: "50mb", // Increase the request body limit (default is 1mb)
    },
    externalResolver: true, // optional
  },
};

export default nextConfig;