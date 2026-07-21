import type { McpServerInfo } from "@tambo-ai/react/mcp";

/**
 * localStorage key holding the user's MCP server list. Written by the
 * /mcp-config page, read here and handed to TamboMcpProvider.
 */
export const MCP_SERVERS_STORAGE_KEY = "mcp-servers";

/**
 * Load and process MCP server configurations from localStorage
 */
export function loadMcpServers(): (McpServerInfo | string)[] {
  if (typeof window === "undefined") return [];

  const savedServersData = localStorage.getItem(MCP_SERVERS_STORAGE_KEY);
  if (!savedServersData) return [];

  try {
    const servers = JSON.parse(savedServersData);
    // Deduplicate servers by URL to prevent multiple tool registrations
    const uniqueUrls = new Set();
    return servers.filter((server: McpServerInfo | string) => {
      const url = typeof server === "string" ? server : server.url;
      if (uniqueUrls.has(url)) return false;
      uniqueUrls.add(url);
      return true;
    });
  } catch (e) {
    console.error("Failed to parse saved MCP servers", e);
    return [];
  }
}
