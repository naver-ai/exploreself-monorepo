module.exports = {
  apps : [{
    name: 'exploreself',
    script: 'nx run backend:serve:production',
    log_file: './logs/pm2.log',
    error_file: "./logs/pm2.error.log",
    out_file: "./logs/pm2.out.log",
    watch: false
  }]
};
