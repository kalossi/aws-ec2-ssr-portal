# AWS EC2 machine loging utility & S3 bucket upload demo

A simple site to view your ec2 instances in cloud, using aws-sdk API (work in progress)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Prerequisites

- You need node and npm installed
- I installed Docker container for the PG server testing

```
npm install @aws-sdk/client-ec2 @aws-sdk/client-s3 pg ws fs
```
```
npm install --save-dev @types/ws
```
Usage example:
```
npm run dev
```

## AI Assistant Guidelines

**Important**: When working with GitHub Copilot or AI assistants on this project:

- **DO NOT** modify code directly without explicit user approval
- **ONLY** suggest code changes and architectural recommendations
- **ALWAYS** ask or wait for user confirmation before editing files and make simple unless asked otherwise
- **FOCUS** on teaching and explanation so the user learns and remembers. Also check that the whole project is functional and makes sense through different files
- **PREFER** showing code examples over making automatic changes
```
docker compose -f robotfw-docker-compose.yml run --rm robot
```
## Folder structure for tests:
```text
robot-project/
│
├── tests/
│   ├── browser-tests.robot
│   └── mock-ec2.json
└── results/ (untracked)

RESULTS ARE ONLY SAVED ON LOCALLY RUN TESTS!
```
# TODO: