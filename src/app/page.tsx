"use client";
import { MessageThreadFull } from "@/components/ui/message-thread-full";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { loadMcpServers } from "@/lib/mcp-utils";
import { components } from "@/lib/tambo";
import { createContext7McpServer } from "@/lib/context7-mcp";
import { TamboProvider } from "@tambo-ai/react";
import { TamboMcpProvider } from "@tambo-ai/react/mcp";

export default function Home() {
  // Load MCP server configurations
  const mcpServers = loadMcpServers();

  // Add Context7 MCP server if configured
  const context7Server = createContext7McpServer();
  const allMcpServers = [...mcpServers, context7Server];

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <TamboProvider
        apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
        components={components}
      >
        <TamboMcpProvider mcpServers={allMcpServers}>
          <div className="w-full max-w-4xl mx-auto">
            <MessageThreadFull contextKey="tambo-template" />
          </div>
        </TamboMcpProvider>
      </TamboProvider>
    </div>
  );
}
