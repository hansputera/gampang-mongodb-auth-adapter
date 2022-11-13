import {Core} from 'gampang';
import type {Collection} from 'mongodb';
import {wrapBuffMongo} from './utils';

// mongodb creds schema
// _id = cred key
// value = cred value

export const readCreds = async (
    collection: Collection,
): Promise<Core.AuthenticationCreds> => {
    const creds = (await collection
        .find()
        .map((doc) => [
            doc.id,
            typeof doc.value === 'object'
                ? wrapBuffMongo(doc.value)
                : doc.value,
        ])
        .toArray()) as any[];
    if (!creds?.length) return Core.initAuthCreds();
    return Object.fromEntries(creds) as Core.AuthenticationCreds;
};

export const saveCreds = async (
    collection: Collection,
    creds: Core.AuthenticationCreds,
): Promise<void> => {
    for (const credential of Object.entries(creds)) {
        await collection.updateOne(
            {
                $where: `this.id === "${credential[0]}"`,
            },
            {
                $set: {
                    id: credential[0],
                    value: credential[1],
                },
            },
            {
                upsert: true,
            },
        );
    }
};
