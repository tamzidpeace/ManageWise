import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function testDbConnection() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database');
    
    // Define a simple schema for testing
    const testSchema = new mongoose.Schema({
      name: String,
      description: String
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Try to create a document
    const testDoc = await TestModel.create({
      name: 'Test Document',
      description: 'Test description'
    });
    console.log('Document created:', testDoc);
    
    // Clean up
    await TestModel.findByIdAndDelete(testDoc._id);
    console.log('Document deleted');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error:', error);
  }
}

testDbConnection();