/** @type {import('next').NextConfig} */
require('next-ws/server').verifyPatch();
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
}

module.exports = nextConfig
