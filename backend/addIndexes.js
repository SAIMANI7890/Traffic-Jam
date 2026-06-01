import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const addIndexes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    console.log('📋 Creating indexes...\n');

    // MenuItem indexes
    console.log('Creating MenuItem indexes...');
    await db.collection('menuitems').createIndex({ organizationId: 1 });
    await db.collection('menuitems').createIndex({ organizationId: 1, category: 1 });
    await db.collection('menuitems').createIndex({ organizationId: 1, isAvailable: 1 });
    console.log('✅ MenuItem indexes created');

    // Order indexes
    console.log('Creating Order indexes...');
    await db.collection('orders').createIndex({ organizationId: 1 });
    await db.collection('orders').createIndex({ organizationId: 1, status: 1 });
    await db.collection('orders').createIndex({ organizationId: 1, createdAt: -1 });
    await db.collection('orders').createIndex({ organizationId: 1, tableId: 1 });
    await db.collection('orders').createIndex({ organizationId: 1, layoutId: 1 });
    console.log('✅ Order indexes created');

    // Layout indexes
    console.log('Creating Layout indexes...');
    await db.collection('layouts').createIndex({ organizationId: 1 });
    await db.collection('layouts').createIndex({ organizationId: 1, isActive: 1 });
    console.log('✅ Layout indexes created');

    // Category indexes
    console.log('Creating Category indexes...');
    await db.collection('categories').createIndex({ organizationId: 1 });
    console.log('✅ Category indexes created');

    // User indexes
    console.log('Creating User indexes...');
    try {
      await db.collection('users').createIndex({ email: 1 });
    } catch (error) {
      if (error.code === 86) {
        console.log('  ℹ️  Email index already exists (skipping)');
      } else {
        throw error;
      }
    }
    await db.collection('users').createIndex({ organizationId: 1, role: 1 });
    console.log('✅ User indexes created');

    console.log('\n🎉 All indexes created successfully!\n');
    
    // List all indexes
    console.log('📊 Index Summary:\n');
    const collections = ['menuitems', 'orders', 'layouts', 'categories', 'users'];
    
    for (const collName of collections) {
      try {
        const indexes = await db.collection(collName).indexes();
        console.log(`${collName}:`);
        indexes.forEach(index => {
          console.log(`  - ${index.name}`);
        });
        console.log('');
      } catch (error) {
        console.log(`${collName}: Collection not found (will be created when first document is inserted)`);
        console.log('');
      }
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('\n✨ Done! Your database is now optimized for production.');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
};

addIndexes();
