const guildService = require("./guildService");
const { Permissions } = require("discord.js");

class Guild {

    constructor(id, categoryId) {
        this.id = id
        this.categoryId = categoryId;
        console.log(`Guild connected with id ${this.id}!`)
    }

}

exports.Guild = Guild