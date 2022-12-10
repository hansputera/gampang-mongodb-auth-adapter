import {Core} from 'gampang';
import type {Collection, Document, WithId} from 'mongodb';
import {wrapBuffMongo} from './utils';

export const writeThing = async <T>(
    collection: Collection,
    key: string,
    value: T,
) =>
    collection.updateOne(
        {
            id: key,
        },
        {
            $set: {
                id: key,
                value,
            },
        },
        {
            upsert: true,
        },
    );

export const getKeys = async <T extends keyof Core.SignalDataTypeMap>(
    collection: Collection,
    type: T,
    ids: string[],
    verbose: boolean
): Promise<Record<string, Core.SignalDataTypeMap[T]>> => {
    const data = (await collection
        .find({
            id: {
                $in: ids.map((x) => `${type}-${x}`),
            },
        })
        .map((doc) => {
            doc.value = wrapBuffMongo(doc.value);
            if (doc.id === 'app-state-sync-key') {
                doc.value = Core.proto.Message.AppStateSyncKeyData.fromObject(
                    doc.value,
                );
            }

            const idSplits = doc.id.split('-');
            doc.id = idSplits[idSplits.length-1];
            return doc;
        })
        .toArray()) as WithId<Document>[];
    if (verbose) {
        console.log('[GAMPANG-MONGO-ADAPTER#getKeys]: Keys', ids.map((x) => `"${type}-${x}"`).join(', '));
        console.log('[GAMPANG-MONGO-ADAPTER#getKeys]: found', data.length, 'values');
    }
    return Object.fromEntries(data.map((doc) => [doc.id, doc.value]));
};

export const setKeys = async (
    collection: Collection,
    data: Core.SignalDataSet,
    verbose: boolean
): Promise<void> => {
    for (const sample of Object.entries(data)) {
        for (const entries of Object.entries(sample[1])) {
            if (verbose) {
                console.log('[GAMPANG-MONGO-ADAPTER#setKeys]: Set for', sample[0], entries[0]);
            }
            writeThing(collection, `${sample[0]}-${entries[0]}`, entries[1]);
        }
    }
};
