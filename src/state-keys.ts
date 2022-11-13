import {Core} from 'gampang';
import type {Collection, Document, WithId} from 'mongodb';
import {unsetProp} from './utils';

export const writeThing = async <T>(
    collection: Collection,
    key: string,
    value: T,
) =>
    collection.updateOne(
        {
            $where: `this._id === "${key}"`,
        },
        {
            $set: {
                _id: key,
                ...value,
            },
        },
    );

export const getKeys = async <T extends keyof Core.SignalDataTypeMap>(
    collection: Collection,
    type: T,
    ids: string[],
): Promise<Record<string, Core.SignalDataTypeMap[T]>> => {
    const data = (await collection
        .find({
            $or: ids.map((id) => ({
                $where: `this._id === "${type}-${id}"`,
            })),
        })
        .map((doc) => {
            if (doc._id.toString() === 'app-state-sync-key') {
                return Core.proto.Message.AppStateSyncKeyData.fromObject(doc);
            } else return doc;
        })
        .toArray()) as WithId<Document>[];

    return Object.fromEntries(
        data.map((doc) => [doc._id, unsetProp(doc, '_id')]),
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
