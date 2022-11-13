import type {MongoClient} from 'mongodb';

export type Options = {
    /**
     * You can fill your mongodb client here.
     * @type {MongoClient}
     */
    db?: MongoClient;
    /**
     * You should fill correct database name here.
     * @type {string}
     */
    dbName: string;
};
