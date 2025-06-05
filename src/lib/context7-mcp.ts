import { handleX402Flow, PaymentDetails } from './x402';

export interface Context7SearchRequest {
  query: string;
  maxResults?: number;
  includeSnippets?: boolean;
}

export interface Context7SearchResult {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  relevanceScore?: number;
}

export interface Context7SearchResponse {
  results: Context7SearchResult[];
  totalResults: number;
  query: string;
  processingTime: number;
}

/**
 * Context7 MCP Server configuration
 */
export const CONTEXT7_MCP_CONFIG = {
  name: 'Context7 Search MCP',
  url: process.env.NEXT_PUBLIC_CONTEXT7_MCP_URL || 'https://api.context7.com/mcp',
  transport: 'HTTP' as const,
  requiresPayment: true,
  paymentAmount: '0.1', // USDC
};

/**
 * Make a search request to Context7 MCP server
 */
async function makeContext7Request(
  searchRequest: Context7SearchRequest,
  paymentProof?: string
): Promise<Context7SearchResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add payment proof if available
  if (paymentProof) {
    headers['X-Payment-Proof'] = paymentProof;
  }

  const response = await fetch(`${CONTEXT7_MCP_CONFIG.url}/search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      method: 'search',
      params: {
        query: searchRequest.query,
        maxResults: searchRequest.maxResults || 10,
        includeSnippets: searchRequest.includeSnippets !== false,
      },
    }),
  });

  if (response.status === 402) {
    // Payment required - throw error with payment details
    const paymentData = await response.json().catch(() => ({}));
    const error = new Error('Payment Required');
    (error as any).response = {
      status: 402,
      data: {
        message: 'Payment required for Context7 MCP search',
        amount: CONTEXT7_MCP_CONFIG.paymentAmount,
        recipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT,
        description: `Context7 search for: "${searchRequest.query}"`,
        ...paymentData,
      },
    };
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Context7 MCP request failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Handle MCP response format
  if (data.error) {
    throw new Error(`Context7 MCP error: ${data.error.message}`);
  }

  return data.result || data;
}

/**
 * Search using Context7 MCP with x402 payment handling
 */
export async function searchWithContext7(
  searchRequest: Context7SearchRequest,
  userAddress: string,
  onPaymentRequired?: (paymentDetails: PaymentDetails) => Promise<boolean>
): Promise<Context7SearchResponse> {
  return handleX402Flow(
    () => makeContext7Request(searchRequest),
    userAddress,
    onPaymentRequired
  );
}

/**
 * Create Context7 MCP server configuration for Tambo
 */
export function createContext7McpServer() {
  return {
    name: CONTEXT7_MCP_CONFIG.name,
    url: CONTEXT7_MCP_CONFIG.url,
    transport: CONTEXT7_MCP_CONFIG.transport,
    tools: [
      {
        name: 'context7_search',
        description: 'Search using Context7 MCP server with payment required (0.1 USDC)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to execute',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 10)',
              default: 10,
            },
            includeSnippets: {
              type: 'boolean',
              description: 'Whether to include content snippets (default: true)',
              default: true,
            },
          },
          required: ['query'],
        },
      },
    ],
  };
}

/**
 * Process Context7 search results for display
 */
export function formatContext7Results(response: Context7SearchResponse): string {
  if (!response.results || response.results.length === 0) {
    return `No results found for "${response.query}"`;
  }

  let formatted = `Found ${response.totalResults} results for "${response.query}":\n\n`;
  
  response.results.forEach((result, index) => {
    formatted += `${index + 1}. **${result.title}**\n`;
    formatted += `   URL: ${result.url}\n`;
    if (result.snippet) {
      formatted += `   ${result.snippet}\n`;
    }
    if (result.relevanceScore) {
      formatted += `   Relevance: ${(result.relevanceScore * 100).toFixed(1)}%\n`;
    }
    formatted += '\n';
  });

  formatted += `\n*Search completed in ${response.processingTime}ms*`;
  
  return formatted;
}

/**
 * Check if Context7 MCP is available and configured
 */
export function isContext7Available(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CONTEXT7_MCP_URL &&
    process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT
  );
}

/**
 * Get Context7 configuration status
 */
export function getContext7Status() {
  return {
    available: isContext7Available(),
    url: CONTEXT7_MCP_CONFIG.url,
    paymentAmount: CONTEXT7_MCP_CONFIG.paymentAmount,
    paymentRecipient: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT,
  };
}
