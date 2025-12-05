# Impact Studio

Impact Studio is a playing consulting platform built with Next.js, Convex, and shadcn/ui.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Backend**: [Convex](https://convex.dev) - Real-time database and serverless functions
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Package Manager**: [Bun](https://bun.sh)
- **Code Quality**: [Biome](https://biomejs.dev) & [Ultracite](https://ultracite.dev)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A Convex account (created automatically when you run `bunx convex dev`)

### Development Setup

1. Install dependencies:

```bash
bun install
```

2. Start the development servers (Next.js + Convex):

```bash
bun dev
```

This will start both the Convex dev server and Next.js dev server concurrently.

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Seed the database with sample clients:
   - Click the "Seed Database with Sample Clients" button on the homepage, or
   - Run the seed mutation from the Convex dashboard (Functions tab → `seedClients`), or
   - Run: `bun run seed` (requires `NEXT_PUBLIC_CONVEX_URL` to be set)

### Available Scripts

- `bun dev` - Start both Convex and Next.js dev servers
- `bun dev:next` - Start only Next.js dev server
- `bun dev:convex` - Start only Convex dev server
- `bun build` - Build the Next.js app for production
- `bun start` - Start the production Next.js server
- `bun seed` - Seed the database with sample clients

## Code Quality

This project uses **Biome** (via **Ultracite**) for formatting and linting.

### Linting

Check for linting issues:

```bash
bun lint
```

### Formatting

Format code automatically:

```bash
bun format
```

### Using Ultracite

Ultracite provides a zero-config Biome preset. You can also use it directly:

```bash
# Check for issues
bunx ultracite check

# Fix issues automatically
bunx ultracite fix

# Diagnose setup
bunx ultracite doctor
```

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).

2. Import your project on [Vercel](https://vercel.com/new):
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Next.js settings

3. Configure environment variables:
   - Add `NEXT_PUBLIC_CONVEX_URL` from your Convex deployment
   - Get this from your Convex dashboard or `.env.local` file

4. Deploy Convex:
   - Run `bunx convex deploy` to deploy your Convex functions
   - Or use the Convex dashboard to deploy

5. Click "Deploy" - Vercel will build and deploy your app.

### Environment Variables

Make sure to set the following environment variables in your deployment:

- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL (required)

You can find this URL in:

- Your `.env.local` file (created by `bunx convex dev`)
- The Convex dashboard under your deployment settings

### Post-Deployment

After deployment, make sure to:

1. Seed your production database with initial data (if needed)
2. Verify environment variables are set correctly
3. Test the application functionality

## Project Structure

```
├── app/              # Next.js App Router pages and components
├── convex/           # Convex backend functions and schema
├── components/       # React components (shadcn/ui)
├── lib/              # Utility functions
└── scripts/          # Utility scripts (e.g., seed.ts)
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
