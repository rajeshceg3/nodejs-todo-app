const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('./logger');

let client;
let db;
let mongod;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      logger.info('No MONGODB_URI provided. Starting MongoMemoryServer...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      logger.info(`MongoMemoryServer started at ${uri}`);
    } else {
        logger.info('Connecting to provided MONGODB_URI...');
    }

    client = new MongoClient(uri); // removed deprecated options
    await client.connect();

    // Determine DB name
    const dbName = process.env.DB_NAME || 'prod';
    db = client.db(dbName);

    logger.info(`Connected to database: ${dbName}`);
    return db;
  } catch (err) {
    logger.error(`Failed to connect to database: ${err.message}`);
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
