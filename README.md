# Gampang MongoDB Adapter

Simple gampang auth adapter in MongoDB version.

## Usage

It's very simple:

```ts
import {useMongoDBAdapter} from '@gampang-pkg/mongodb-adapter';

// session is SessionManager, you can use 'client.session' also
await session.registerAdapter(useMongoDBAdapter, {
    uri: 'your mongodb connection uri',
    dbName: 'gampang-sessions',
});
```

If you want use your mongodb client, just add the `db` in the options ^\_

## License

MIT
