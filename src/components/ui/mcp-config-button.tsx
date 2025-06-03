"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export const McpConfigButton = () => {
  // Load MCP server configurations from localStorage
  const [mcpServerCount, setMcpServerCount] = useState<number>(0);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const savedServers = localStorage.getItem("mcp-servers");
      if (savedServers) {
        try {
          const servers = JSON.parse(savedServers);
          setMcpServerCount(servers.length);
        } catch (e) {
          console.error("Failed to parse saved MCP servers", e);
        }
      }
    }
  }, []);

  return (
    <div className="absolute top-2 right-2 z-10">
      <Link
        href="/mcp-config"
        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-full hover:bg-primary/90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>MCP Config</span>
        {mcpServerCount > 0 && (
          <span className="flex items-center justify-center bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 ml-1">
            {mcpServerCount}
          </span>
        )}
      </Link>
    </div>
  );
};
