import "dotenv/config.js";

export default function env() {
  return ({
    PORT: process.env.PORT || '3001',
    POSTGRES_URL: process.env.POSTGRES_URL || 'postgres://postgres:password@localhost/testfb'
  })
}