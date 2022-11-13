import {Binary, MongoClient, MongoClientOptions} from 'mongodb';
import * as assert from 'node:assert';
import type {Options} from './@types';

export const validateAdapterOptions = async (args: Options): Promise<void> => {
    assert.ok(
        typeof args === 'object' && !Array.isArray(args),
        "'args' should be an object!",
    );

    if (args.db) {
        assert.ok(
            args.db instanceof MongoClient,
            "'args.db' is exists, but the value is not valid",
        );
    }

    assert.strictEqual(
        typeof args.uri,
        'string',
        "'args.uri' should be a string or valid mongodb connection uri!",
    );

    assert.strictEqual(
        typeof args.dbName,
        'string',
        "'args.dbName' should be a string!",
    );
};

export const connectToDB = (uri: string, opts?: MongoClientOptions) =>
    new MongoClient(uri, opts).connect();

export const unsetProp = <T extends Record<K, unknown>, K extends keyof T>(
    obj: T,
    ...props: K[]
): Omit<T, keyof typeof props> => {
    for (const key of props) {
        delete obj[key];
    }

    return obj;
};

export const wrapBuffMongo = <T extends Record<string, any>>(data: T): T => {
    if (!data) return data;
    for (const key of Object.keys(data)) {
        if (data[key] instanceof Binary) {
            Reflect.set(data, key, data[key].buffer);
        } else if (typeof data[key] === 'object') {
            if (Array.isArray(data[key])) {
                Reflect.set(
                    data,
                    key,
                    data[key].map((v: {}) => wrapBuffMongo(v)),
                );
            }

            Reflect.set(data, key, wrapBuffMongo(data[key]));
        }
    }

    return data;
};
