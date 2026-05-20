// test-login-api.js
async function test() {
  try {
    console.log('Sending login request to http://localhost:3001/api/auth/login...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arjun@sparkclub.edu',
        password: 'password123'
      })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
    }
    
    const { token, user } = await loginRes.json();
    console.log('✅ Login successful!');
    console.log('User:', JSON.stringify(user));
    console.log('Token Length:', token.length);

    console.log('Fetching dashboard metrics with JWT...');
    const dashRes = await fetch('http://localhost:3001/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!dashRes.ok) {
      throw new Error(`Dashboard fetch failed with status ${dashRes.status}: ${await dashRes.text()}`);
    }

    const dashData = await dashRes.json();
    console.log('✅ Dashboard metrics loaded successfully!');
    console.log('Metrics:', JSON.stringify(dashData.metrics));
    console.log('Recent Transactions Count:', dashData.recentTransactions.length);
    console.log('Budget Utilization Count:', dashData.budgetUtilization.length);
  } catch (err) {
    console.error('❌ Error during API verification:', err.message);
    process.exit(1);
  }
}

test();
