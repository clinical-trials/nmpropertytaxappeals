// Static-demo build config: exports the front-end prototype as a static site
// for GitHub Pages (project site at /nmpropertytaxappeals/). The full app on
// `main` uses server routes + a database and is NOT statically exportable.
const repo = "nmpropertytaxappeals";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
