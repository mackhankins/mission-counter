const { EmbedBuilder, ApplicationCommandType, ChannelType } = require("discord.js")
const client = require("../../index")
require("dotenv").config();
const persistance = require("../../persistance")
const config = require('../../config')
const { longFormChannelName, countMissions } = require("../../utils")

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
          name: 'channel',
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
    const server = client.guilds.cache.get(guild.id)
    const channels = server.channels.cache.filter(c => c.parentId == guild.categoryId && c.type === 15)
    channels.forEach(function (channel) {
      choices.push({
        name: longFormChannelName(channel.name),
        value: channel.id,
      })
    })
    interaction.respond(choices).catch(console.error);
  },

  run: async (client, interaction) => {
    const channelId = await interaction.options.get('channel').value

    if (channelId.toString()) {

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

      const threadName = await interaction.user.username + interaction.user.discriminator
      const forum = await interaction.member.guild.channels.cache.get(channelId)
      const thread = await forum.threads.cache.find(t => t.name.toLowerCase() === threadName.replace(/[^\w ]/, '').toLowerCase())

      if (!thread) {
        const thread = await forum.threads.create({
          name: threadName.replace(/[^\w ]/, '').toLowerCase(),
          autoArchiveDuration: 60,
          message: {
            content: 'tracking missions for ' + interaction.user.tag,
          },
          reason: interaction.user.tag + ' is awesome.',
          type: ChannelType.PrivateThread,
        })


        thread.send(
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
          .setTitle("Successful Submission")
          .setDescription('@' + interaction.user.tag + ' has completed ' + completed + ' missions!  Keep going')
          .setTimestamp()
          .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
        interaction.reply({ embeds: [embed] });
      } else {

        const messages = await thread.messages.fetch()

        const messagesByBot = await messages.filter(mb => mb.author.id === client.user.id && mb.content.startsWith('user:'))

        const lastMissionCount = +countMissions(messagesByBot) + +completed

        const messageWithAttachnent = await messages.filter(m => m.attachments.size > 0)

        const attachmentDuplicate = await messageWithAttachnent.some(function (m) {
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
                  .setTitle("Duplicate Found")
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

        if (!attachmentDuplicate) {
          thread.send(
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
            .setTitle("Successful Submission")
            .setDescription('@' + interaction.user.tag + ' has completed ' + lastMissionCount + ' missions!  Keep going')
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL()}` })
          interaction.reply({ embeds: [embed] });
        }
      }
    }
  },
};