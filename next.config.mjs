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

};

export default withLlamaIndex(nextConfig);
