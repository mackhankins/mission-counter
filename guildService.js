const persistance = require('./persistance')
const { Guild } = require('./Guild')

const defaultServer = {
    "categoryId": "undefined"
}

function createDefault(id) {
    mission_counter = { ...defaultServer }
    mission_counter["id"] = id
    return new Promise((resolve, reject) => {
        persistance.create(mission_counter).then((data, err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log
            const tmp = new Guild(data.id, data.categoryId)
            resolve(tmp);
        })
    })
}

function save(guild) {
    const obj = {
        "id": guild.id,
        "categoryId": guild.categoryId,
    }
    return persistance.save(obj);
}

const idToServerMap = new Map();

function get(id) {
    return new Promise((resolve, reject) => {
        persistance.find(id).then((data, err) => {
            if (err) {
                reject(err);
            } else {
                if (!data) {
                    resolve(data);
                    return;
                }
                const tmp = new Guild(data.id, data.categoryId)
                resolve(tmp);
            }
        })
    })
}

function login(id) {
    if (!idToServerMap.has(id)) {
        get(id).then(resultGuild => {
            if (resultGuild) {
                idToServerMap.set(id, resultGuild)
                idToServerMap.get(id)
            } else {
                createDefault(id).then((resultDefault) => {
                    idToServerMap.set(id, resultDefault);
                    idToServerMap.get(id)
                })
            }
        })
    } else {
        idToServerMap.get(id)
    }

    return idToServerMap

}


exports.createDefault = createDefault;
exports.get = get;
exports.login = login;
exports.save = save;