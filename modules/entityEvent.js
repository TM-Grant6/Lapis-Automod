const config = require("../config.json");

function entityEventVaildate(packet, dbAccount, client, id, realm) {
    if (!packet || !dbAccount || !client || !id || !realm) return;

    if (config.debug) console.log(`Entity Event Vaildate`);

    if (config.entityEventChecks.eventCheck1.enabled && packet.event_id === 'player_add_xp_levels') {
        console.log(`[${dbAccount.xuid}] XP randomly given to them. [T1]`);
        if (!config.debug) {
            client.sendCommand(`xp -${packet.data}l ${dbAccount.currentGamertag}`);

            switch (config.entityEventChecks.eventCheck1.punishment) {
                case "kick":
                    client.sendCommand(`kick "${dbAccount.xuid}" Invaild event. (0x27e1)`, 0)
                    dbAccount.kickCount++
                    dbAccount.save()
                    break
                case "ban":
                    client.sendCommand(`kick "${dbAccount.xuid}" Invaild event. (0x27e1)`, 0)
                    dbAccount.banCount++
                    dbAccount.isBanned = true
                    dbAccount.save()
                    break
                case "clubKick":
                    if (realm.isOwner) {
                        client.realm.kick(dbAccount.xuid);
                        dbAccount.clubKickCount++
                        dbAccount.save()
                    }
                    break
                case "clubBan":
                    if (realm.isOwner) {
                        client.realm.ban(dbAccount.xuid);
                        dbAccount.clubBanCount++
                        dbAccount.save()
                    }
                    break
                case "warning":
                    client.sendCommand(`say "${dbAccount.xuid}" sent a invaild event information. (0x27e1)`, 0)
                    dbAccount.warningCount++
                    dbAccount.save()
                    break
            }
        }
    }
}

module.exports = {
    entityEventVaildate
};