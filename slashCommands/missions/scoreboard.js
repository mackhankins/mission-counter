const { EmbedBuilder, ApplicationCommandType } = require("discord.js")
const persistance = require("../../persistance")
const client = require("../../index");
const { splitContent, countMissions, totalString, longFormChannelName } = require("../../utils")

async function processThreads(forumThreads) {
    let totals = []
    for (let thread of await forumThreads) {
        let messageCollection = await thread[1].messages.fetch()
        let botMessages = await messageCollection.filter(m => m.author.id === client.user.id && m.content.startsWith("user:"))
        if (botMessages.size === 0) continue
        let finalCount = countMissions(await botMessages)
        let lastMessage = splitContent(await botMessages.first().content)
        totals.push({
            name: lastMessage[0],
            count: finalCount
        })
    }
    await totals.sort((a,b) => (a.count < b.count) ? 1 : -1)

    var sumTotal = 0
    totals.forEach(item => {
        sumTotal = +sumTotal + +item.count
    })

    totals.push({
        name: 'Total',
        count: sumTotal
    })

    return totals
}


module.exports = {
    type: ApplicationCommandType.ChatInput,
    name: "scoreboard",
    description: "individual and overall totals for a push",
    userPerms: [],
    botPerms: [],
    options: [
        {
            type: 3,
            name: 'push',
            description: 'select a push',
            required: true,
            autocomplete: true,
        }
    ],

    autocomplete: async (interaction, choices) => {
        const guildID = interaction.member.guild.id;
        const countGuild = await persistance.count(guildID)
        if (!countGuild) return
        const guild = await persistance.find(guildID)
        const server = await client.guilds.cache.get(guild.id)
        const channels = await server.channels.cache.filter(c => c.parentId == guild.categoryId && c.type === 15)
        channels.forEach(function (channel) {
            choices.push({
                name: longFormChannelName(channel.name),
                value: channel.id,
            })
        })
        interaction.respond(choices).catch(console.error);
    },

    run: async (client, interaction) => {
        if (interaction.type === 2) {
            const channelId = interaction.options.get('push').value
            const parent = await interaction.member.guild.channels.cache.get(channelId)
            const forum = await interaction.member.guild.channels.cache.filter(c => c.type === 11 && c.parentId === channelId)
            const totalArray = await processThreads(forum)
            const total = totalString(totalArray)

            const embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle('Scoreboard: ' + longFormChannelName(parent.name))
                .setDescription(total)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
            interaction.reply({ embeds: [embed] })
        }
    },
};