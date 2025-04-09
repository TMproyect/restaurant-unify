// Mock implementation of API endpoints for development
// This would be replaced by real API endpoints in production

// Create a simple response handler
function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Route handler for API requests
export async function handleApiRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log(`[Mock API] Request to: ${path} - Method: ${request.method}`);
  
  // Handle prioritize order endpoint
  if (path.match(/\/api\/orders\/(.+)\/prioritize/) && request.method === 'POST') {
    const orderId = path.split('/')[3];
    console.log(`[Mock API] Prioritizing order ${orderId}`);
    
    // Mock a slight delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return createResponse({ success: true, message: `Order ${orderId} has been prioritized` });
  }
  
  // Handle unknown endpoints
  return createResponse({ error: 'Endpoint not found' }, 404);
}

// Initialize the mock API
export function setupMockApi() {
  // Intercept fetch calls to our API endpoints
  const originalFetch = window.fetch;
  
  window.fetch = function(input, init) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    // If this is a request to our mock API
    if (url.includes('/api/orders/')) {
      console.log(`[Mock API] Intercepting fetch call to: ${url}`);
      
      // Create a mock request object
      const request = new Request(url, init);
      
      // Handle the request with our mock API
      return handleApiRequest(request);
    }
    
    // Otherwise, pass through to the original fetch
    return originalFetch.apply(this, arguments);
  };
  
  console.log('[Mock API] Mock API setup complete');
}

// Auto-initialize when this module is imported
setupMockApi();
