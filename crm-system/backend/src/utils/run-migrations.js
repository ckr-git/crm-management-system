/* Simple migration runner for backend/database/migrations */
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');
const SequelizeLib = require('sequelize');

async function run() {
  const migrationsDir = path.join(__dirname, '../../database/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.js'))
    .sort();

  const queryInterface = sequelize.getQueryInterface();

  console.log(`Found ${files.length} migration files`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    // skip pure SQL files handled elsewhere
    if (file.endsWith('.sql')) continue;

    console.log(`\n➡️  Running migration: ${file}`);
    const migration = require(filePath);
    if (migration && typeof migration.up === 'function') {
      try {
        await migration.up(queryInterface, SequelizeLib);
        console.log(`✅ Done: ${file}`);
      } catch (err) {
        console.error(`❌ Failed: ${file} ->`, err.message);
        process.exit(1);
      }
    } else if (typeof migration === 'function') {
      try {
        await migration();
        console.log(`✅ Done (script): ${file}`);
      } catch (err) {
        console.error(`❌ Failed (script): ${file} ->`, err.message);
        process.exit(1);
      }
    } else {
      console.log(`ℹ️  Skip (no up function): ${file}`);
    }
  }

  await sequelize.close();
  console.log('\nAll migrations completed.');
}

run();
