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

    const creds = await readCreds(db.collection('credentials'), !!args.verbose);

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => getKeys(db.collection('keys'), type, ids, !!args.verbose),
                set: (data) => setKeys(db.collection('keys'), data, !!args.verbose),
            },
        },
        save: () => saveCreds(db.collection('credentials'), creds, !!args.verbose),
    };
};

export * as Utils from './utils';
// debug purposes
export * as StateKeys from './state-keys';
export * as Creds from './creds';
