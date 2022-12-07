const { EmbedBuilder, ApplicationCommandType, ChannelType } = require("discord.js")
const client = require("../../index")
require("dotenv").config();
const persistance = require("../../persistance")
const config = require('../../config')
const { longFormChannelName, countMissions } = require("../../utils");
const { channel } = require("diagnostics_channel");

const missionCount = []
for (i = 1; i <= 3; i++) {
  missionCount.push({
    name: i,
    value: '' + i + '',
  })
}

module.exports = {
  name: "add",
  description: "add mission",
  options: [
    {
      type: ApplicationCommandType.ChatInput,
      name: "mission",
      description: "mission",
      cooldown: 3000,
      userPerms: [],
      botPerms: [],
      options: [
        {
          type: 3,
          name: 'push',
          description: 'select a push',
          required: true,
          autocomplete: true,
        },
        {
          type: 3,
          name: 'completed',
          description: 'how many missions did you complete?',
          choices: missionCount,
          required: true,
        },
        {
          type: 11,
          name: 'screenshot',
          description: 'screenschot of complete missions and points',
          content_type: 'image/png',
          required: true,
        },
      ]
    }
  ],

  autocomplete: async (interaction, choices) => {
    const guildID = interaction.member.guild.id;
    const countGuild = await persistance.count(guildID)
    if (!countGuild) return
    const guild = await persistance.find(guildID)
    const forum = await interaction.member.guild.channels.cache.get(guild.categoryId)
    const threads = await forum.threads.cache.filter(t => t.ownerId === process.env.CLIENT_ID && t.type === 11 && t.archived === false)
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
      const channelId = await interaction.options.get('push').value
      const completed = await interaction.options.get('completed').value
      const screenShot = await interaction.options.get('screenshot')

      if (! await screenShot.attachment.contentType.startsWith('image')) {
        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Invalid Attatchment Type")
          .setDescription('The attachment must be an image')
          .setTimestamp()
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
        interaction.reply({ embeds: [embed] });
        return
      }

      const forum = await interaction.member.guild.channels.cache.get(channelId)

      const userMessages = await forum.messages.fetch().then(ms => {
        return ms.filter(m => m.author.id === process.env.CLIENT_ID && m.content.startsWith('user: ' + interaction.user.tag))
      })

      const lastMissionCount = +countMissions(await userMessages) + +completed

      let attachmentDuplicate = false

      if (userMessages) {
        const messageWithAttachnent = await userMessages.filter(m => m.attachments.size > 0)

        attachmentDuplicate = await messageWithAttachnent.some(function (m) {
          m.attachments.some(a => {
            let oldAttachment = [{
              size: a.size,
              height: a.height,
              width: a.width,
            }]

            let newAttachment = [{
              size: screenShot.attachment.size,
              height: screenShot.attachment.height,
              width: screenShot.attachment.width,
            }]

            foundDuplicate = (JSON.stringify(oldAttachment) === JSON.stringify(newAttachment)) ? true : false

            if (foundDuplicate) {
              const embeds = [
                new EmbedBuilder()
                  .setColor("#FF0000")
                  .setURL("https://example.org/")
                  .setImage(screenShot.attachment.url)
                  .setTitle("Duplicate Found: " + longFormChannelName(forum.name))
                  .setDescription(`Sorry the two submissions appear to be a duplicate. \n Latency : ${client.ws.ping}ms`)
                  .setTimestamp()
                  .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` }),
                new EmbedBuilder().setURL("https://example.org/").setImage(a.url),
              ];

              interaction.reply({ embeds });
            }

            return foundDuplicate
          })

          return m = foundDuplicate
        })
      }

      if (!attachmentDuplicate) {
        forum.send(
          {
            content: 'user: ' + interaction.user.tag + ' missions: ' + completed,
            files: [
              {
                attachment: screenShot.attachment.url,
              }
            ]
          }
        )

        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("Successful Submission: " + longFormChannelName(forum.name))
          .setDescription('@' + interaction.user.tag + ' has completed ' + lastMissionCount + ' missions!  Keep going')
          .setTimestamp()
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
        interaction.reply({ embeds: [embed] });
      }
    }
  },
};