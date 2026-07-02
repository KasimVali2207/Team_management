import { StorageService } from './src/services/storage.service';

async function test() {
  console.log("Fetching employees...");
  const employees = await StorageService.getAllEmployees();
  console.log(`Found ${employees.length} employees`);
  
  const members = employees.filter((e: any) => e.profile?.role === 'Member');
  console.log(`Found ${members.length} members`);
  
  console.log("Member Profiles:");
  members.forEach((m: any) => {
    console.log(`- ${m.profile?.name} (Role: ${m.profile?.role})`);
  });
}

test();
