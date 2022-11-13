import {Adapter} from 'gampang';
import type {Options} from './@types';

import {connectToDB, validateAdapterOptions} from './utils';
import {getKeys, setKeys} from './state-keys';
import {readCreds, saveCreds} from './creds';

export const useMongoDBAdapter: Adapter<Options> = async (_, __, args) => {
    await validateAdapterOptions(args);
    const db = (args.db || (await connectToDB(args.uri, args.dbOptions))).db(
        args.dbName,
    );

    const creds = await readCreds(db.collection('credentials'));

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => getKeys(db.collection('keys'), type, ids),
                set: (data) => setKeys(db.collection('keys'), data),
            },
        },
        save: () => saveCreds(db.collection('credentials'), creds),
    };
};

export * as Utils from './utils';
