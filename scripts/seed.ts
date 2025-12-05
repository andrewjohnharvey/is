import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error(
    "Error: NEXT_PUBLIC_CONVEX_URL environment variable is not set."
  );
  console.error(
    "Please run 'npx convex dev' first to get your Convex deployment URL."
  );
  process.exit(1);
}

async function seed() {
  // CONVEX_URL is guaranteed to be defined due to the check above
  const client = new ConvexHttpClient(CONVEX_URL as string);
  console.log("Seeding database with sample clients...");

  try {
    const result = await client.mutation(api.seed.seedClients, {});
    console.log("✅ Success:", result.message);
    console.log(`   Total clients: ${result.count}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
