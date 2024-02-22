const {
	isUUIDv4
} = require("../util.js");

const config = require("../config.json");

function emoteVaildate(packet, dbAccount, client) {
    if (packet.flags === 'mute_chat') {
        console.log(`[${dbAccount.xuid}] Bad emote information [1]`);
        if(!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a1)`, 0)
    }

    if (!isUUIDv4(packet.emote_id)) {
        console.log(`[${dbAccount.xuid}] Bad emote information [2]`);
        if(!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a2)`, 0)
    }
}

module.exports = {
	emoteVaildate: emoteVaildate
};