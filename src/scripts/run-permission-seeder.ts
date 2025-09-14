import { seedPermissions } from '@/database/permission-seeder';
import { config } from 'dotenv';


// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  try {
    console.log('Starting permission seeding...');
    await seedPermissions();
    console.log('Permission seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error in permission seeding:', error);
    process.exit(1);
  }
}

main();