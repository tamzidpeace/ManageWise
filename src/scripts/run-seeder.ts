import { createAdminUser } from '@/database/admin-seeder';
import { seedPermissions } from '@/database/permission-seeder';
import { config } from 'dotenv';
import mongoose from 'mongoose';


// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  try {
    console.log('Starting permission seeding...');
    await seedPermissions();
    console.log('Permission seeding completed');
    
    console.log('Starting admin user setup...');
    await createAdminUser();
    console.log('Admin user setup completed');
    
    // Close the mongoose connection to allow the process to exit
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error in seeding process:', error);
    // Close the mongoose connection even if there was an error
    mongoose.connection.close();
    process.exit(1);
  }
}

main();