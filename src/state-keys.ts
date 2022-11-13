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
            $where: `this.id === "${key}"`,
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
): Promise<Record<string, Core.SignalDataTypeMap[T]>> => {
    const data = (await collection
        .find({
            $where: `[${ids
                .map((x) => `"${type}-${x}"`)
                .join(',')}].includes(this.id)`,
        })
        .map((doc) => {
            doc = wrapBuffMongo(doc.value);
            if (doc.id === 'app-state-sync-key') {
                doc.value = Core.proto.Message.AppStateSyncKeyData.fromObject(
                    doc.value,
                );
            }

            return doc;
        })
        .toArray()) as WithId<Document>[];

    return Object.fromEntries(data.map((doc) => [doc.id, doc.value]));
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
