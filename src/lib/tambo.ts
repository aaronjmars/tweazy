/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { Graph, graphSchema } from "@/components/ui/graph";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { searchWithContext7 } from "@/lib/context7-mcp";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  // Set the MCP tools https://localhost:3000/mcp-config
  // Add non MCP tools here
  {
    name: "context7_search",
    description: "Search using Context7 MCP with x402 payment (0.1 USDC on Sepolia). Requires wallet connection.",
    propsSchema: z.object({
      query: z.string().describe("Search query to execute"),
      maxResults: z.number().optional().describe("Maximum number of results (default: 10)"),
    }),
    handler: async ({ query, maxResults = 10 }, { userAddress }) => {
      if (!userAddress) {
        throw new Error("Wallet connection required for Context7 search");
      }

      try {
        const response = await searchWithContext7(
          { query, maxResults },
          userAddress
        );

        return {
          success: true,
          results: response.results,
          totalResults: response.totalResults,
          query: response.query,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Search failed",
        };
      }
    },
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "Use this when you want to display a chart. It supports bar, line, and pie charts. When you see data generally use this component.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCards",
    description:
      "Use this when you want to display a list of information (>2 elements) that user might want to select from. Not anything that is a list or has links. ",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Add more components here
];
