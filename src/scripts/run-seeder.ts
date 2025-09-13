import { createAdminUser } from '@/database/admin-seeder';
import { config } from 'dotenv';


// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  try {
    await createAdminUser();
    console.log('Admin user setup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

main();