const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

let client;
let db;
let mongod;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('No MONGODB_URI provided. Starting MongoMemoryServer...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`MongoMemoryServer started at ${uri}`);
    } else {
        console.log('Connecting to provided MONGODB_URI...');
    }

    client = new MongoClient(uri); // removed deprecated options
    await client.connect();

    // Determine DB name
    const dbName = process.env.DB_NAME || 'prod';
    db = client.db(dbName);

    console.log(`Connected to database: ${dbName}`);
    return db;
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
    if (client) await client.close();
    if (mongod) await mongod.stop();
};

module.exports = { connectDB, getDb, closeDB };
