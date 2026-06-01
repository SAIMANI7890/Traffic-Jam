import { isValidEmail } from "./utils/validation.js";

console.log("🧪 Testing Email Validation\n");

const testEmails = [
  // Valid emails
  { email: "user@example.com", expected: true },
  { email: "john.doe@company.co.uk", expected: true },
  { email: "admin@restaurant.io", expected: true },
  { email: "test+tag@gmail.com", expected: true },
  { email: "user_name@domain.com", expected: true },
  { email: "first.last@sub.domain.com", expected: true },
  { email: "mani@gmail.co", expected: true }, // .co is valid (Colombia TLD)
  
  // Invalid emails
  { email: "mani@gmail.c", expected: false }, // TLD too short (1 char)
  { email: "user@domain", expected: false }, // No TLD
  { email: "user@.com", expected: false }, // No domain
  { email: "@domain.com", expected: false }, // No local part
  { email: "user@domain.", expected: false }, // Empty TLD
  { email: "user domain@test.com", expected: false }, // Space in local part
  { email: "user@domain .com", expected: false }, // Space in domain
  { email: "user@@domain.com", expected: false }, // Double @
  { email: "user", expected: false }, // No @ symbol
  { email: "", expected: false }, // Empty string
  { email: "user@", expected: false }, // No domain
  { email: "user@domain.c", expected: false }, // TLD too short (1 char)
  { email: "user@domain.123", expected: false }, // TLD with numbers
];

let passed = 0;
let failed = 0;

testEmails.forEach(({ email, expected }) => {
  const result = isValidEmail(email);
  const status = result === expected ? "✅ PASS" : "❌ FAIL";
  
  if (result === expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} | "${email}" | Expected: ${expected}, Got: ${result}`);
});

console.log("\n" + "=".repeat(60));
console.log(`📊 Results: ${passed} passed, ${failed} failed`);
console.log("=".repeat(60));

if (failed === 0) {
  console.log("✅ All tests passed!");
} else {
  console.log(`❌ ${failed} test(s) failed`);
  process.exit(1);
}
