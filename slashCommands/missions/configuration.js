const { ChannelType, EmbedBuilder } = require("discord.js");
const client = require("../../index")
const persistance = require("../../persistance")
const guildService = require("../../guildService")

module.exports = {
    name: "configuration",
    description: "Set the category pushes should be created under",
    options: [
        {
            type: 7,
            name: 'channel',
            description: 'select a category',
            required: true,
            autocomplete: true,
            defaultMemberPermissions: 0,
        },
    ],

    autocomplete: async (interaction, choices) => {
        const guildID = interaction.member.guild.id;
        const server = client.guilds.cache.get(guildID)
        const channels = server.channels.cache.filter(c => c.type === ChannelType.GuildForum)
        channels.forEach(function (channel) {
            choices.push({
                name: channel.name,
                value: channel.id,
            })
        })
        interaction.respond(choices).catch(console.error);
    },

    run: async (client, interaction) => {

        const channelId = interaction.options.get('channel').value

        const guildId = interaction.member.guild.id

        const guild = []

        guild.id = guildId
        guild.categoryId = channelId

        if (persistance.upsert(guild)) {
            const embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("Configuration Updated")
                .setDescription(`Latency : ${client.ws.ping}ms`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` });
            interaction.reply({ embeds: [embed] });
        }
    },
};