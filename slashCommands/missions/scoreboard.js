const { EmbedBuilder, ApplicationCommandType, Collection } = require("discord.js")
const persistance = require("../../persistance")
const client = require("../../index");
const { splitContent, countMissions, totalString, longFormChannelName, addOrReplace, lots_of_messages_getter } = require("../../utils")

async function fetchMore(channel, limit = 1000) {
    if (!channel) {
      throw new Error(`Expected channel, got ${typeof channel}.`);
    }
    if (limit <= 100) {
      return channel.messages.fetch({ limit });
    }
  
    let collection = new Collection();
    let lastId = null;
    let options = {};
    let remaining = limit;
  
    while (remaining > 0) {
      options.limit = remaining > 100 ? 100 : remaining;
      remaining = remaining > 100 ? remaining - 100 : 0;
  
      if (lastId) {
        options.before = lastId;
      }
  
      let messages = await channel.messages.fetch(options);
  
      if (!messages.last()) {
        break;
      }
  
      collection = collection.concat(messages);
      lastId = messages.last().id;
    }
  
    return collection;
  }

async function processMessages(messages) {
    let totals = []
    console.log(messages.size)
    for (let message of await messages) {
        let finalCount = countMissions(await message[1])
        let lastMessage = splitContent(await message[1].content)
            totals.push({
                name: lastMessage[0],
                count: finalCount
            })
    }
    totals = addOrReplace(totals)
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
        const forum = await interaction.member.guild.channels.cache.get(guild.categoryId)
        await forum.threads.fetchArchived()
        const threads = await forum.threads.cache.filter(t => t.ownerId === process.env.CLIENT_ID && t.type === 11)
        for (const thread of threads) {
          choices.push({
            name: longFormChannelName(thread[1].name),
            value: thread[1].id,
          })
        }
        interaction.respond(choices).catch(console.error);
    },

    run: async (client, interaction) => {
        if (interaction.type === 2) {
            const channelId = interaction.options.get('push').value
            const parent = await interaction.member.guild.channels.cache.get(channelId)
            const messages = await fetchMore(parent)
            const messagesFiltered = await messages.filter(m => m.author.id === process.env.CLIENT_ID && m.content.startsWith('user: '))
            const totalArray = await processMessages(await messagesFiltered)
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