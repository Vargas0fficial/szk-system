// Migrate appointment documents from the "test" database to "szk_pang1".
// Usage: node scripts/migrate-appointments.js
//
// Safe to run multiple times — it skips any document whose _id already
// exists in the destination collection, so it won't create duplicates.

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI. Make sure it is set in your .env.local file.');
    process.exit(1);
}

const SOURCE_DB = 'test';
const TARGET_DB = 'szk_pang1';
const COLLECTION = 'appointments';

async function migrate() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();

        const sourceCol = client.db(SOURCE_DB).collection(COLLECTION);
        const targetCol = client.db(TARGET_DB).collection(COLLECTION);

        const docs = await sourceCol.find({}).toArray();

        if (docs.length === 0) {
            console.log(`No documents found in ${SOURCE_DB}.${COLLECTION}. Nothing to migrate.`);
            return;
        }

        console.log(`Found ${docs.length} document(s) in ${SOURCE_DB}.${COLLECTION}.`);

        let inserted = 0;
        let skipped = 0;

        for (const doc of docs) {
            const exists = await targetCol.findOne({ _id: doc._id });
            if (exists) {
                skipped++;
                continue;
            }
            await targetCol.insertOne(doc);
            inserted++;
        }

        console.log(`Migration complete. Inserted: ${inserted}, Skipped (already existed): ${skipped}.`);
        console.log(`You can now verify the data in ${TARGET_DB}.${COLLECTION}, then delete it from ${SOURCE_DB}.${COLLECTION} if everything looks correct.`);
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await client.close();
    }
}

migrate();