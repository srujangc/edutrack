import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutrack';
  
  try {
    // Attempt standard connection with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Standalone MongoDB not detected at ${uri} (${err.message}). Starting embedded MongoMemoryServer fallback...`);
    try {
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'edutrack'
        }
      });
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected successfully to MongoMemoryServer: ${memoryUri}`);
    } catch (memErr) {
      console.error(`[Database] Failed to initialize embedded MongoDB: ${memErr.message}`);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[Database] MongoDB disconnected');
  });
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};
