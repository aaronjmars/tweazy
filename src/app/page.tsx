import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { ExternalLinkIcon } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl w-full space-y-8">
        <div className="flex flex-col items-center">
          <a href="https://tambo.co" target="_blank" rel="noopener noreferrer">
            <Image
              src="/Octo-Icon.svg"
              alt="Tambo AI Logo"
              width={80}
              height={80}
              className="mb-4"
            />
          </a>
          <h1 className="text-4xl text-center">tambo-ai chat template</h1>
        </div>

        <div className="w-full space-y-8">
          <div className="bg-white px-8 py-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Setup Checklist</h2>
            <ApiKeyCheck>
              <h2 className="text-xl font-semibold">Next steps</h2>

              <div className="flex gap-4 flex-wrap items-center">
                <a
                  href="/chat"
                  className="px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-lg bg-[#7FFFC3] hover:bg-[#72e6b0] text-gray-800"
                >
                  Go to Chat →
                </a>
                <p className="text-gray-600">Start chatting with Tambo</p>
              </div>

              <div className="flex gap-4 flex-wrap items-center">
                <a
                  href="https://tambo.co/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-lg bg-[#7FFFC3] hover:bg-[#72e6b0] text-gray-800"
                >
                  Server-side MCP Config →
                </a>
                <p className="text-gray-600">
                  Learn about{" "}
                  <a
                    href="https://tambo.co/docs/concepts/model-context-protocol#1-server-side-support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    server-side MCP servers{" "}
                    <ExternalLinkIcon className="w-4 h-4 inline-block" />
                  </a>
                </p>
              </div>
              <div className="flex gap-4 flex-wrap items-center">
                <a
                  href="/mcp-config"
                  className="px-6 py-3 rounded-md font-medium shadow-sm transition-colors text-lg bg-[#7FFFC3] hover:bg-[#72e6b0] text-gray-800"
                >
                  Client-side MCP Config →
                </a>
                <p className="text-gray-600">
                  Learn about{" "}
                  <a
                    href="https://tambo.co/docs/concepts/model-context-protocol#2-client-side-support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    client-side MCP servers{" "}
                    <ExternalLinkIcon className="w-4 h-4 inline-block" />
                  </a>
                </p>
              </div>
            </ApiKeyCheck>
          </div>

          <div className="bg-white px-8 py-4">
            <h2 className="text-xl font-semibold mb-4">How it works:</h2>
            <p className="text-gray-600 mb-4">
              This is demo of how to build generative UI with MCP servers.
            </p>
            <p className="text-gray-600 mb-4">
              We support both client-side and server-side MCP servers, see the
              difference{" "}
              <a
                href="https://tambo.co/docs/concepts/model-context-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                here.
              </a>
            </p>
            <div className="flex gap-4 flex-wrap mt-4">
              <a
                href="https://tambo.co/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-md font-medium transition-colors text-lg mt-4 border border-gray-300 hover:bg-gray-50"
              >
                View Docs
              </a>
              <a
                href="https://smithery.ai/server/@mikechao/brave-search-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-md font-medium transition-colors text-lg mt-4 border border-gray-300 hover:bg-gray-50"
              >
                Get MCP Servers
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
