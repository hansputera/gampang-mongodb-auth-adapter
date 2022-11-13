import {Core} from 'gampang';
import type {Collection, Document, WithId} from 'mongodb';
import {unsetProp, wrapBuffMongo} from './utils';

export const writeThing = async <T>(
    collection: Collection,
    key: string,
    value: T,
) =>
    collection.updateOne(
        {
            $where: `this.id === "${key}"`,
        },
        {
            $set: {
                id: key,
                ...value,
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
): Promise<Record<string, Core.SignalDataTypeMap[T]>> => {
    const data = (await collection
        .find({
            $where: `[${ids
                .map((x) => `"${type}-${x}"`)
                .join(',')}].includes(this.id)`,
        })
        .map((doc) => {
            doc = wrapBuffMongo(doc);
            if (doc._id.toString() === 'app-state-sync-key') {
                return Core.proto.Message.AppStateSyncKeyData.fromObject(doc);
            } else return doc;
        })
        .toArray()) as WithId<Document>[];

    return Object.fromEntries(
        data.map((doc) => [doc.id, unsetProp(doc, '_id')]),
    );
};

export const setKeys = async (
    collection: Collection,
    data: Core.SignalDataSet,
): Promise<void> => {
    for (const sample of Object.entries(data)) {
        for (const entries of Object.entries(sample[1])) {
            writeThing(collection, `${sample[0]}-${entries[0]}`, entries[1]);
        }
    }
};
