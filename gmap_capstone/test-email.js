// Test script to check if the Edge Function is working
// Run this in your browser console to test the email service

async function testEmailService() {
  try {
    console.log('🧪 Testing email service...');
    
    // Test the Edge Function directly
    const response = await fetch('https://your-project-ref.supabase.co/functions/v1/send-verification-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        code: '123456'
      })
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Edge Function is working!');
    } else {
      console.log('❌ Edge Function error:', result);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEmailService();





