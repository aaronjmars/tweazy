/**
 * Type for MCP Server entries
 */
export type McpServer = string | { url: string };

/**
 * Load and process MCP server configurations from localStorage
 */
export function loadMcpServers(): McpServer[] {
  if (typeof window === "undefined") return [];

  const savedServersData = localStorage.getItem("mcp-servers");
  if (!savedServersData) return [];

  try {
    const servers = JSON.parse(savedServersData);
    // Deduplicate servers by URL to prevent multiple tool registrations
    const uniqueUrls = new Set();
    return servers.filter((server: McpServer) => {
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
