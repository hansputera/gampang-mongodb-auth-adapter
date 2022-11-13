import type {MongoClient, MongoClientOptions} from 'mongodb';

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
    /**
     * You can fill this field with additional mongodb client options
     * @type {MongoClientOptions}
     */
    dbOptions?: MongoClientOptions;
    /**
     * You should fill mongodb connection uri here
     * @type {string}
     */
    uri: string;
};
