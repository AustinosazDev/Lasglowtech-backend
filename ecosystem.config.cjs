/**
 * PM2 ecosystem file for production (VPS).
 * Usage: pm2 start ecosystem.config.cjs
 * Or:    pm2 start ecosystem.config.cjs --env production
 */
module.exports = {
  apps: [
    {
      name: 'lasglowblog-api',
      script: 'index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
