const client = require(`../index`)
const jimp = require(`jimp`);

function sendChatEmbed(player, message) {
    const config = require(`../config.json`);
    if (config.clientOptions.lapisOptions.enableTextHandler) {
        if (config.clientOptions.discordChannels.text !== ``) {
            try {
                client.channels.cache.get(config.clientOptions.discordChannels.text).send(
                    {
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(player)
                                .setDescription(message)
                        ]
                    }
                );
            } catch {
                console.log(`Error requesting to send message to ${client.channels.cache.get(config.clientOptions.discordChannels.text).name}, please confirm that the bot has the required channel permissions and the channel exists`);
            }
        }
    }
}

function sendSkinEmbed(player, skinBuffer) {
    try {
        const texture = 
        try {
            client.channels.cache.get(config.clientOptions.discordChannels.text).send(
                {
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(player)
                            .setThumbnail()
                    ]
                }
            );
        } catch {
            console.log(`Error requesting to send message to ${client.channels.cache.get(config.clientOptions.discordChannels.text).name}, please confirm that the bot has the required channel permissions and the channel exists`);
        }
    } catch (error) {
        console.log(`error ${error}`);
    }
}

module.exports = { sendChatEmbed }