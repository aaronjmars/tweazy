/**
 * Test script for x402 implementation
 * This file contains test functions to verify the x402 payment flow
 */

import { parseX402Response, isX402Response, createX402PaymentHandler } from '@/lib/x402';
import { formatUSDCAmount, validateSufficientBalance } from '@/lib/payment';
import { searchWithContext7, formatContext7Results } from '@/lib/context7-mcp';

// Mock test data
const mockX402Error = {
  response: {
    status: 402,
    data: {
      message: 'Payment required for Context7 MCP search',
      amount: '0.1',
      recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      description: 'Context7 search payment',
    },
  },
};

const mockSearchResponse = {
  results: [
    {
      id: '1',
      title: 'Test Result 1',
      url: 'https://example.com/1',
      snippet: 'This is a test search result snippet',
      relevanceScore: 0.95,
    },
    {
      id: '2',
      title: 'Test Result 2',
      url: 'https://example.com/2',
      snippet: 'Another test search result',
      relevanceScore: 0.87,
    },
  ],
  totalResults: 2,
  query: 'test search',
  processingTime: 150,
};

/**
 * Test x402 response parsing
 */
export function testX402Parsing() {
  console.log('Testing x402 response parsing...');
  
  const x402Response = parseX402Response(mockX402Error);
  
  if (x402Response && isX402Response(x402Response)) {
    console.log('✅ x402 parsing successful');
    console.log('Payment details:', x402Response.paymentRequired);
  } else {
    console.log('❌ x402 parsing failed');
  }
}

/**
 * Test USDC amount formatting
 */
export function testUSDCFormatting() {
  console.log('Testing USDC formatting...');
  
  const testAmounts = ['0.1', '1.0', '10.5', '0.001'];
  
  testAmounts.forEach(amount => {
    const formatted = formatUSDCAmount(amount);
    console.log(`${amount} -> ${formatted}`);
  });
  
  console.log('✅ USDC formatting test completed');
}

/**
 * Test search result formatting
 */
export function testSearchResultFormatting() {
  console.log('Testing search result formatting...');
  
  const formatted = formatContext7Results(mockSearchResponse);
  console.log('Formatted results:');
  console.log(formatted);
  
  console.log('✅ Search result formatting test completed');
}

/**
 * Test payment handler creation
 */
export function testPaymentHandlerCreation() {
  console.log('Testing payment handler creation...');
  
  const testAddress = '0x1234567890123456789012345678901234567890';
  const handler = createX402PaymentHandler(testAddress);
  
  if (handler && typeof handler.handlePayment === 'function' && typeof handler.validatePayment === 'function') {
    console.log('✅ Payment handler created successfully');
  } else {
    console.log('❌ Payment handler creation failed');
  }
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('🧪 Running x402 implementation tests...\n');
  
  testX402Parsing();
  console.log('');
  
  testUSDCFormatting();
  console.log('');
  
  testSearchResultFormatting();
  console.log('');
  
  testPaymentHandlerCreation();
  console.log('');
  
  console.log('🎉 All tests completed!');
}

// Export test functions for use in browser console
if (typeof window !== 'undefined') {
  (window as any).x402Tests = {
    runAllTests,
    testX402Parsing,
    testUSDCFormatting,
    testSearchResultFormatting,
    testPaymentHandlerCreation,
  };
}
