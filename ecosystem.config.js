module.exports = {
    apps: [
      {
        name: 'quizmaster-backend',
        script: 'npx',
        args: 'tsx server/index.ts',
        cwd: '/root/quiz-master',
        env: {
          NODE_ENV: 'production',
          PORT: 3001
        },
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        error_file: './logs/backend-error.log',
        out_file: './logs/backend-out.log',
        log_file: './logs/backend-combined.log',
        time: true
      },
      {
        name: 'quizmaster-frontend',
        script: 'npm',
        args: 'start',
        cwd: '/root/quiz-master',
        env: {
          NODE_ENV: 'production',
          PORT: 3000,
          NEXT_PUBLIC_SOCKET_URL: 'http://164.90.225.146:3001'
        },
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        error_file: './logs/frontend-error.log',
        out_file: './logs/frontend-out.log',
        log_file: './logs/frontend-combined.log',
        time: true
      }
    ]
  };
  