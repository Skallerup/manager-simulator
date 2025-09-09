const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function testUserRegistration() {
  const baseUrl = "http://localhost:4000";

  console.log("Testing user registration...");

  try {
    // Test registration
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "testuser@example.com",
        password: "testpassword123",
        name: "Test User",
      }),
    });

    const registerData = await registerResponse.json();

    if (registerResponse.ok) {
      console.log("✅ Registration successful:", registerData);
    } else {
      console.log("❌ Registration failed:", registerData);
      return;
    }

    // Test login
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "testuser@example.com",
        password: "testpassword123",
      }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      console.log("✅ Login successful:", loginData);
    } else {
      console.log("❌ Login failed:", loginData);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testUserRegistration();
