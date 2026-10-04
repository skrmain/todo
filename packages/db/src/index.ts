import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';

export { default as Todo } from './models/todo.model.js';

export async function connectDb(dbUrl: string, dbName: string) {
    mongoose.connection.on('error', (error) => {
        console.log('db: Connection Error', error);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('db: Connection Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('db: Connection ReConnected');
    });

    mongoose.connection.on('connected', () => {
        console.log(`db: Connected to '${mongoose.connection.db?.databaseName}' database`);
    });

    await mongoose.connect(dbUrl, { dbName, serverSelectionTimeoutMS: 2_000 });
}

export function isMongooseError(error: unknown): error is MongoServerError {
    return error instanceof MongoServerError;
}
