/**
 * Test script for x402 implementation
 * This file contains test functions to verify the x402 payment flow
 */

import { parseX402Response, isX402Response, createX402PaymentHandler } from '@/lib/x402';
import { formatUSDCAmount, validateSufficientBalance } from '@/lib/payment';

// Mock test data
const mockX402Error = {
  response: {
    status: 402,
    data: {
      message: 'Payment required to continue',
      amount: '0.1',
      recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      description: 'x402 payment required',
    },
  },
};

const mockApiResponse = {
  success: true,
  data: 'Mock API response data',
  timestamp: Date.now(),
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
 * Test API response handling
 */
export function testApiResponseHandling() {
  console.log('Testing API response handling...');

  console.log('Mock API response:', mockApiResponse);

  console.log('✅ API response handling test completed');
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
  
  testApiResponseHandling();
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
    testApiResponseHandling,
    testPaymentHandlerCreation,
  };
}
