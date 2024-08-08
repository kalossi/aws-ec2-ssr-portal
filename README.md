# AWS EC2 machine loging utility

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
npm install aws-sdk
```
```
npm install
```
```
npm install ws
```
```
npm install --save-dev @types/ws
```
```
npm install pg
```
```
npm i --save-dev @types/bcrypt
```
## The db used in this example is initiated using following yaml for Docker:
```
services:
  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_USER: pg
      POSTGRES_PASSWORD: test1234
      POSTGRES_DB: test
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 1s
      timeout: 5s
      retries: 10
    ports:
      - "5432:5432"
    volumes:
      - pg_data_volume:/var/lib/postgresql/data

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080
volumes:
  pg_data_volume:
```

## TODO:
- What next? What could _it_ do? :)