import Permission from '@/models/Permission';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { Permissions } from '@/schemas/permissions';

export const seedPermissions = async () => {
  await dbConnect();

  try {
    // Get all permissions from the enum
    const permissionKeys = Object.keys(Permissions) as (keyof typeof Permissions)[];
    let createdCount = 0;
    let skippedCount = 0;

    console.log(`Found ${permissionKeys.length} permissions to process`);

    // Process each permission
    for (const key of permissionKeys) {
      const permissionName = Permissions[key];
      // Extract feature from permission name (part before the dot)
      const feature = permissionName.split('.')[0];

      // Check if permission already exists
      const existingPermission = await Permission.findOne({ name: permissionName });

      if (!existingPermission) {
        // Create new permission
        await Permission.create({
          name: permissionName,
          feature: feature,
          description: `${key.replace(/_/g, ' ').toLowerCase()} permission`
        });
        console.log(`Created permission: ${permissionName}`);
        createdCount++;
      } else {
        console.log(`Permission already exists: ${permissionName}`);
        skippedCount++;
      }
    }

    console.log(`Permission seeding completed:`);
    console.log(`- Created: ${createdCount} permissions`);
    console.log(`- Skipped: ${skippedCount} permissions (already existed)`);

    return { createdCount, skippedCount };
  } catch (error) {
    console.error('Error in permission seeder:', error);
    throw error;
  }
};

// Run the seeder and properly close the connection
if (require.main === module) {
  seedPermissions().then(() => {
    console.log('Permission seeding completed successfully');
    // Close the mongoose connection to allow the process to exit
    mongoose.connection.close();
  }).catch((error) => {
    console.error('Error seeding permissions:', error);
    // Close the mongoose connection even if there was an error
    mongoose.connection.close();
    process.exit(1);
  });
}

export default seedPermissions;