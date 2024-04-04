const {
	isUUIDv4
} = require("../src/util.js");

const config = require("../config.json");

function emoteVaildate(packet, dbAccount, client) {
    if (!packet || !dbAccount || !client) return;
    
    if (config.debug) console.log(`Emote Vaildate`);

    if (config.emoteChecks.emoteCheck1.enabled && packet.flags === 'mute_chat') {
        console.log(`[${dbAccount.xuid}] Bad emote information [T1]`);
        if(!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a1)`, 0)
    }

    if (config.emoteChecks.emoteCheck2.enabled && !isUUIDv4(packet.emote_id)) {
        console.log(`[${dbAccount.xuid}] Bad emote information [T2]`);
        if(!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a2)`, 0)
    }
}

module.exports = {
	emoteVaildate: emoteVaildate
};