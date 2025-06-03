"use client";
import { McpServerInfo, MCPTransport } from "@tambo-ai/react/mcp";
import Link from "next/link";
import { useEffect, useState } from "react";

const McpConfigPage = () => {
  // Initialize from localStorage directly to avoid conflicts
  const initialMcpServers =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mcp-servers") || "[]")
      : [];

  const [mcpServers, setMcpServers] =
    useState<McpServerInfo[]>(initialMcpServers);
  const [serverUrl, setServerUrl] = useState("");
  const [serverName, setServerName] = useState("");
  const [transportType, setTransportType] = useState<MCPTransport>(
    MCPTransport.HTTP,
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load saved servers from localStorage on mount
  // This useEffect can be removed since we initialize from localStorage directly

  // Save servers to localStorage when updated
  useEffect(() => {
    console.log("Saving to localStorage:", mcpServers);
    localStorage.setItem("mcp-servers", JSON.stringify(mcpServers));
    if (mcpServers.length > 0) {
      setSavedSuccess(true);
      const timer = setTimeout(() => setSavedSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mcpServers]);

  const addServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverUrl.trim()) {
      console.log("Adding server:", serverUrl.trim());

      const serverConfig = {
        url: serverUrl.trim(),
        transport: transportType,
        ...(serverName.trim() ? { name: serverName.trim() } : {}),
      };
      setMcpServers((prev) => [...prev, serverConfig]);

      // Reset form fields
      setServerUrl("");
      setServerName("");
      setTransportType(MCPTransport.HTTP);

      // Double-check localStorage immediately after update
      setTimeout(() => {
        const saved = localStorage.getItem("mcp-servers");
        console.log("Immediate localStorage check:", saved);
      }, 100);
    }
  };

  const removeServer = (index: number) => {
    console.log("Removing server at index:", index);
    setMcpServers((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper function to get server display information
  const getServerInfo = (server: McpServerInfo) => {
    if (typeof server === "string") {
      return { url: server, transport: "SSE (default)", name: null };
    } else {
      return {
        url: server.url,
        transport: server.transport || "SSE (default)",
        name: server.name || null,
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">MCP Server Configuration</h1>
          <Link
            href="/chat"
            className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/80"
          >
            Back to Chat
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Model Context Protocol Servers
          </h2>
          <p className="text-gray-600 mb-4">
            Configure client-side MCP servers to extend the capabilities of your
            Tambo application. These servers will be connected{" "}
            <i>from the browser</i> and exposed as tools to Tambo.
          </p>

          <p className="text-gray-600 mb-4">
            For more information about MCP and the difference between
            client-side and server-side MCP servers, see the{" "}
            <a
              href="https://tambo.co/docs/concepts/model-context-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              documentation
            </a>
            .
          </p>

          <form onSubmit={addServer} className="mb-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="server-url" className="font-medium text-gray-700">
                Server URL (must be accessible from the browser)
              </label>
              <input
                id="server-url"
                type="url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://your-mcp-server-url.com"
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col space-y-2 mt-3">
              <label
                htmlFor="server-name"
                className="font-medium text-gray-700"
              >
                Server Name (optional)
              </label>
              <input
                id="server-name"
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="Custom server name"
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col space-y-2 mt-3">
              <label
                htmlFor="transport-type"
                className="font-medium text-gray-700"
              >
                Transport Type
              </label>
              <select
                id="transport-type"
                value={transportType}
                onChange={(e) =>
                  setTransportType(e.target.value as MCPTransport)
                }
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={MCPTransport.SSE}>SSE</option>
                <option value={MCPTransport.HTTP}>HTTP (default)</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-4 px-4 py-2 rounded-md w-full bg-black text-white hover:bg-black/80"
            >
              Add Server
            </button>
          </form>

          {savedSuccess && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md">
              ✓ Servers saved to browser storage
            </div>
          )}

          {mcpServers.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-2">Connected Servers:</h3>
              <ul className="border rounded-md divide-y">
                {mcpServers.map((server, index) => {
                  const serverInfo = getServerInfo(server);
                  return (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">●</span>
                          <span>{serverInfo.url}</span>
                        </div>
                        {(serverInfo.name || typeof server !== "string") && (
                          <div className="text-sm text-gray-600 ml-5 mt-1">
                            {serverInfo.name && (
                              <div>Name: {serverInfo.name}</div>
                            )}
                            <div>Transport: {serverInfo.transport}</div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeServer(index)}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 ml-2"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed rounded-md text-gray-500">
              No MCP servers configured yet
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">What is MCP?</h3>
          <p className="text-gray-600 text-sm">
            The{" "}
            <a
              href="https://tambo.co/docs/concepts/model-context-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Model Context Protocol (MCP)
            </a>{" "}
            is a standard that allows applications to communicate with external
            tools and services. By configuring MCP servers, your Tambo
            application will be able to make calls to these tools.
          </p>
        </div>
      </div>
    </div>
  );
};

export default McpConfigPage;
