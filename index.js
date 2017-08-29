const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB || 'mongodb://localhost/smartnode', { useMongoClient: true }).then(
    () => { global.success('Connection to DB successful'); },
    (err) => { global.error('Connection to DB failed!', err); process.exit(0); }
);

let schema = new mongoose.Schema({ 
    key: {
        type: String,
        required: true
    },
    value: { 
        required: true, 
        type: Mixed
    },
}, {
    "toObject": {
        "virtuals": true 
    },
    "toJSON": {
        "virtuals": true 
    },
    "timestamps": true
});

let Schema = mongoose.model('Schema', schema);

///////////////////////////////////////////////

function buildKey(room, plugin, key) {
    return [room, plugin, key].filter((e) => !!e).join('.');
}

module.exports = {
    Client: class Client {
        constructor(pluginName) {
            this._plugin = pluginName;
        }

        async get(key) {
            return (await Schema.findOne({ key: buildKey(null, this._plugin, key) }));
        }

        set(key, value) {
            return (await Schema.updateOne({ key: buildKey(null, this._plugin, key) }, { value }, { upsert: true }));
        }
    },
    Server: class Server {
        constructor({ room, plugin } = {}) {
            this._room = room;
            this._plugin = plugin;
        }

        async get(key) {
            return (await Schema.findOne({ key: buildKey(this._room, this._plugin, key) }));
        }

        set(key, value) {
            return (await Schema.updateOne({ key: buildKey(this._room, this._plugin, key) }, { value }, { upsert: true }));
        }
    }
}