import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.searchQuery) {
      return await ctx.db
        .query("clients")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.searchQuery ?? "")
        )
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("clients")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
