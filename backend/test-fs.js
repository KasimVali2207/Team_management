const fs = require('fs/promises');
const path = require('path');

async function test() {
  const EMPLOYEES_DIR = path.join(__dirname, '../../../data/employees');
  console.log("EMPLOYEES_DIR:", EMPLOYEES_DIR);

  try {
    const files = await fs.readdir(EMPLOYEES_DIR);
    console.log("Files:", files);

    const employees = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(EMPLOYEES_DIR, file), 'utf-8');
        employees.push(JSON.parse(data));
      }
    }

    const members = employees.filter(e => e.profile?.role === 'Member');
    console.log(`totalMembers: ${members.length}`);
  } catch(e) {
    console.error(e);
  }
}

test();
