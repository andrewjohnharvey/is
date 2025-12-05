import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    address: v.string(),
    sicCode: v.string(),
    sicDescription: v.string(),
    employeeCount: v.number(),
  })
    .index("by_name", ["name"])
    .searchIndex("search_name", {
      searchField: "name",
    }),
});
