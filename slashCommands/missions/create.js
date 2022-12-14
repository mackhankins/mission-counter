const { EmbedBuilder, ApplicationCommandType } = require("discord.js")
const persistance = require("../../persistance")
const client = require("../../index")
const config = require('../../config')
const guildService = require("../../guildService")
const dayjs = require('dayjs')

const territories = []
Object.keys(config.territories).forEach(function (key) {
    territories.push({
        name: config.territories[key],
        value: key
    })
})

const dates = []
const date = new dayjs(new Date())
for (i = 0; i <= 6; i++) {
    const optionDate = date.add(i, 'day')
    dates.push({
        name: optionDate.format('MM-DD-YYYY'),
        value: optionDate.format('MM-DD-YYYY'),
    })
}

module.exports = {
    name: "create",
    description: "Creates a push thread for missions to be posted in.",
    options: [
        {
            type: ApplicationCommandType.ChatInput,
            name: "push",
            description: "push",
            options: [
                {
                    type: 3,
                    name: 'territory',
                    description: 'select a territory to push',
                    choices: territories,
                    required: true,
                },
                {
                    type: 3,
                    name: 'date',
                    description: 'choose a date',
                    choices: dates,
                    required: true,
                }
            ]
        },
    ],

    run: async (client, interaction) => {
        const pushDate = interaction.options.get('date').value
        const pushLocation = interaction.options.get('territory').value
        const newChannel = pushLocation + '-' + pushDate
        const guildID = interaction.member.guild.id;
        const guild = await persistance.find(guildID)
        if (!guild.id) {
            guildService.login(guildID)
        }
        const forum = await interaction.member.guild.channels.cache.get(guild.categoryId)
        const thread = await forum.threads.cache.find(t => t.name.toLowerCase() === newChannel.toLowerCase())

        if (!thread) {
          await forum.threads.create({
            name: newChannel.toLowerCase(),
            autoArchiveDuration: 60,
            message: {
              content: 'tracking missions for ' + pushLocation + ' ' + pushDate,
            },
            reason: interaction.user.tag + ' is awesome.',
          })

            const embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("Created forum thread " + newChannel)
                .setDescription(`You can now have members add missions using /add mission`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
            interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(newChannel + " already exists")
                .setDescription(`Error! This forum thread already exists`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
            interaction.reply({ embeds: [embed] });
        }
    },
};