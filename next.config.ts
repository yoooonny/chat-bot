import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'officeparser', 'csv-parser', 'canvas', '@napi-rs/canvas'],
};

export default nextConfig;
