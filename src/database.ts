import {MongoClient, MongoClientOptions} from 'mongodb';

export const connectToDB = (uri: string, opts?: MongoClientOptions) =>
    new MongoClient(uri, opts);
