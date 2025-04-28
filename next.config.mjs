// /** @type {import('next').NextConfig} */
// import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";
//
// const nextConfig = {
//   dirs: ['pages', 'utils', 'app', 'components', 'lib'],
//   webpack: (config, { isServer }) => {
//     if (Array.isArray(config.target) && config.target.includes("web")) {
//       config.target = ["web", "es2020"];
//     }
//
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       sharp$: false,
//       "onnxruntime-node$": false,
//     };
//     config.resolve.fallback ??= {};
//     config.resolve.fallback.fs = false;
//
//     if (!isServer) {
//       config.plugins.push(
//         new MonacoWebpackPlugin({
//           languages: ["typescript"],
//           filename: "static/[name].worker.js",
//         })
//       );
//     }
//
//     config.resolve.alias["replicate"] = false;
//     return config;
//   },
// };
//
// export default nextConfig;

// next.config.mjs / next.config.ts
import withLlamaIndex from 'llamaindex/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  rewrites: async () => {
    return [
      {
        source: '/api/py/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api/py/:path*'
            : '/api/',
      },
      {
        source: '/docs',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api/py/docs'
            : '/api/py/docs',
      },
      {
        source: '/openapi.json',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api/py/openapi.json'
            : '/api/py/openapi.json',
      },
    ];
  },
};

export default withLlamaIndex(nextConfig);
