// tests/api-test.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

async function testAPIEndpoints() {
  try {
    // Test auth endpoints
    console.log('Testing auth endpoints...');
    
    // Test registration
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'API Test User',
        email: 'api-test@example.com',
        password: 'password123',
      }),
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);
    
    // Test login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'api-test@example.com',
        password: 'password123',
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.log('Failed to get auth token');
      return;
    }
    
    const token = loginData.token;
    
    // Test categories endpoint
    console.log('\nTesting categories endpoint...');
    
    const categoryResponse = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'API Test Category',
        description: 'Category created via API test',
      }),
    });
    
    const categoryData = await categoryResponse.json();
    console.log('Category creation response:', categoryData);
    
    // Test brands endpoint
    console.log('\nTesting brands endpoint...');
    
    const brandResponse = await fetch('http://localhost:3000/api/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'API Test Brand',
        description: 'Brand created via API test',
      }),
    });
    
    const brandData = await brandResponse.json();
    console.log('Brand creation response:', brandData);
    
    // Test products endpoint
    console.log('\nTesting products endpoint...');
    
    const productResponse = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'API Test Product',
        categoryId: categoryData.category.id,
        brandId: brandData.brand.id,
        price: 100,
        stock: 5,
        description: 'Product created via API test',
      }),
    });
    
    const productData = await productResponse.json();
    console.log('Product creation response:', productData);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during API tests:', error);
  }
}

testAPIEndpoints();