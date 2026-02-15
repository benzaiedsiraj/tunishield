async function main() {
    // Test 1: Login with unregistered email (should fail with 404)
    console.log("=== Test 1: Login with unregistered email ===");
    try {
        const r1 = await fetch("http://localhost:3000/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "newuser@test.com", type: "login" }),
        });
        const d1 = await r1.json();
        console.log("Status:", r1.status, "Response:", JSON.stringify(d1));
    } catch (e) { console.error("Error:", e.message); }

    // Test 2: Signup with new email (should succeed)
    console.log("\n=== Test 2: Signup with new email ===");
    try {
        const r2 = await fetch("http://localhost:3000/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "newuser@test.com", type: "signup" }),
        });
        const d2 = await r2.json();
        console.log("Status:", r2.status, "Response:", JSON.stringify(d2));
    } catch (e) { console.error("Error:", e.message); }

    // Test 3: /me without session (should return 401)
    console.log("\n=== Test 3: /me without session ===");
    try {
        const r3 = await fetch("http://localhost:3000/api/auth/me");
        const d3 = await r3.json();
        console.log("Status:", r3.status, "Response:", JSON.stringify(d3));
    } catch (e) { console.error("Error:", e.message); }
}

main();
