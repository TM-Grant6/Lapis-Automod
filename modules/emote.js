const {
	isUUIDv4
} = require("../src/util.js");

const config = require("../config.json");

function emoteVaildate(packet, dbAccount, client, realm) {
    if (!packet || !dbAccount || !client || !realm) return;
    
    if (config.debug) console.log(`Emote Vaildate`);

    if (config.emoteChecks.emoteCheck1.enabled && packet.flags === 'mute_chat') {
        console.log(`[${dbAccount.xuid}] Bad emote information [T1]`);
        if(!config.debug) {
            if (config.emoteChecks.emoteCheck1.punishment === "kick") {
                client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a1)`, 0)
                dbAccount.kickCount++
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck1.punishment === "ban") {
                client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a1)`, 0)
                dbAccount.banCount++
                dbAccount.isBanned = true
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck1.punishment === "clubKick" && realm.isOwner) {
                realm.kick(dbAccount.xuid);
                dbAccount.clubKickCount++
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck1.punishment === "clubBan" && realm.isOwner) {
                realm.ban(dbAccount.xuid);
                dbAccount.clubBanCount++
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck1.punishment === "warning") {
                client.sendCommand(`say "${dbAccount.xuid}" You sent invaild emote information. (0x8a1)`, 0)
                dbAccount.warningCount++
                dbAccount.save()
            }
        }
    }

    if (config.emoteChecks.emoteCheck2.enabled && !isUUIDv4(packet.emote_id)) {
        console.log(`[${dbAccount.xuid}] Bad emote information [T2]`);
        if(!config.debug) {
            if (config.emoteChecks.emoteCheck2.punishment === "kick") {
                client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a2)`, 0)
                dbAccount.kickCount++
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck2.punishment === "ban") {
                client.sendCommand(`kick "${dbAccount.xuid}" Invaild emote information sent. (0x8a2)`, 0)
                dbAccount.banCount++
                dbAccount.isBanned = true
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck2.punishment === "clubKick" && realm.isOwner) {
                realm.kick(dbAccount.xuid);
                dbAccount.clubKickCount++
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck2.punishment === "clubBan" && realm.isOwner) {
                realm.ban(dbAccount.xuid);
                dbAccount.clubBanCount++
                dbAccount.save()
            } else if (config.emoteChecks.emoteCheck2.punishment === "warning") {
                client.sendCommand(`say "${dbAccount.xuid}" You sent invaild emote information. (0x8a2)`, 0)
                dbAccount.warningCount++
                dbAccount.save()
            }
        }
    }
}

module.exports = {
	emoteVaildate: emoteVaildate
};