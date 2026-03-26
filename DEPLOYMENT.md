# Deployment Setup

This repository now includes GitHub Actions deployment for:

- Cloudflare Pages: static frontend
- Oracle Cloud VM: NestJS backend over SSH

## 1. GitHub Secrets

Add these repository secrets before enabling the workflow:

### Cloudflare

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`

### Oracle Cloud

- `ORACLE_HOST`
- `ORACLE_USER`
- `ORACLE_PORT`
- `ORACLE_SSH_PRIVATE_KEY`
- `ORACLE_APP_PATH`
- `ORACLE_BACKEND_RESTART_COMMAND`

### Backend environment

- `ORACLE_DATABASE_URL`
- `ORACLE_JWT_SECRET`
- `ORACLE_APP_BASE_URL`
- `ORACLE_ENABLE_ADMIN_SETUP`
- `ORACLE_MAIL_HOST`
- `ORACLE_MAIL_PORT`
- `ORACLE_MAIL_USER`
- `ORACLE_MAIL_PASS`
- `ORACLE_MAIL_FROM`

## 2. Cloudflare Pages

Create a Pages project and point it at this repo.
The workflow publishes the repository root because the frontend is static.

Recommended production branch:

- `main`

## 3. Oracle Cloud VM

Prepare the VM once:

1. Install Node.js 22+, npm, and Prisma engine dependencies.
2. Create the app directory that matches `ORACLE_APP_PATH`.
3. Ensure the SSH user can write to that directory.
4. Install and configure your process manager.

Recommended restart command examples:

- `pm2 reload baraka-market || pm2 start dist/main.js --name baraka-market`
- `sudo systemctl restart baraka-market`

## 4. Workflow Behavior

On every push to `main`:

1. Frontend deploys to Cloudflare Pages
2. Backend files copy to Oracle Cloud
3. Remote deploy script:
   - writes `.env`
   - runs `npm ci`
   - runs `prisma generate`
   - runs `prisma migrate deploy`
   - builds NestJS
   - restarts the backend process

## 5. Files Added

- `.github/workflows/deploy.yml`
- `scripts/deploy-backend.sh`
- `DEPLOYMENT.md`
