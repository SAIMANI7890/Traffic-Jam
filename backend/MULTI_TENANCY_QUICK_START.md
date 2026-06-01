# Multi-Tenancy Quick Start

## For Existing Projects (Migration Required)

### Step 1: Backup Database
```bash
mongodump --uri="your_mongodb_uri" --out=./backup
```

### Step 2: Run Migration
```bash
node migrateToMultiTenancy.js
```

### Step 3: Drop Old Category Index
```javascript
// In MongoDB shell or Compass
db.categories.dropIndex("name_1")
```

### Step 4: Restart Server
```bash
npm start
```

## For New Projects (No Migration Needed)

Just start the server normally:
```bash
npm start
```

All new data will automatically be scoped to organizations.

## Testing Multi-Tenancy

### Quick Test Script
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Test isolation
# Create Admin 1
curl -X POST http://localhost:5000/api/auth/signup/admin \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin1","email":"admin1@test.com","pin":"1234","confirmPin":"1234"}'

# Save the token from response as TOKEN1

# Create a menu item for Admin 1
curl -X POST http://localhost:5000/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"name":"Burger","price":10,"description":"Delicious burger"}'

# Create Admin 2
curl -X POST http://localhost:5000/api/auth/signup/admin \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin2","email":"admin2@test.com","pin":"5678","confirmPin":"5678"}'

# Save the token from response as TOKEN2

# Get menu items for Admin 2 (should be empty)
curl -X GET http://localhost:5000/api/menu \
  -H "Authorization: Bearer $TOKEN2"

# Expected: Empty array []
# This confirms Admin 2 cannot see Admin 1's menu items
```

## Key Points

### ✅ What's Isolated:
- Menu Items
- Categories
- Layouts
- Orders
- Staff Users

### 🔑 How It Works:
1. JWT token contains `organizationId`
2. All API requests automatically filter by `organizationId`
3. All new records automatically get `organizationId` from token

### 📝 Developer Guidelines:

**When creating new data:**
```javascript
// ✅ CORRECT - organizationId is automatically added
const item = await MenuItem.create({
  name,
  price,
  organizationId: req.user.organizationId, // From JWT token
});
```

**When querying data:**
```javascript
// ✅ CORRECT - Always filter by organizationId
const items = await MenuItem.find({
  organizationId: req.user.organizationId,
});

// ❌ WRONG - This would return data from all organizations
const items = await MenuItem.find({});
```

**When updating/deleting:**
```javascript
// ✅ CORRECT - Verify organizationId before modifying
const item = await MenuItem.findOne({
  _id: req.params.id,
  organizationId: req.user.organizationId,
});

// ❌ WRONG - This could modify another organization's data
const item = await MenuItem.findById(req.params.id);
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Forgetting organizationId in queries
```javascript
// BAD
const orders = await Order.find({ status: 'open' });

// GOOD
const orders = await Order.find({
  status: 'open',
  organizationId: req.user.organizationId,
});
```

### ❌ Mistake 2: Not setting organizationId on create
```javascript
// BAD
const layout = await Layout.create({ name, tables });

// GOOD
const layout = await Layout.create({
  name,
  tables,
  organizationId: req.user.organizationId,
});
```

### ❌ Mistake 3: Using findById without organizationId check
```javascript
// BAD - Can access other organization's data
const item = await MenuItem.findById(req.params.id);

// GOOD - Ensures data belongs to user's organization
const item = await MenuItem.findOne({
  _id: req.params.id,
  organizationId: req.user.organizationId,
});
```

## Verification Checklist

After implementing multi-tenancy, verify:

- [ ] All models have `organizationId` field
- [ ] All create operations set `organizationId`
- [ ] All read operations filter by `organizationId`
- [ ] All update operations verify `organizationId`
- [ ] All delete operations verify `organizationId`
- [ ] JWT token includes `organizationId`
- [ ] Migration script ran successfully
- [ ] Old indexes are dropped
- [ ] New compound indexes are created
- [ ] Tests pass for data isolation

## Need Help?

Check the full documentation: `MULTI_TENANCY_IMPLEMENTATION.md`
