const config = require("../config.json");

function equipmentVaildate(packet, dbAccount, client, realm) {
	if (!packet || !dbAccount || !client || !realm) return;

	if (config.debug) console.log(`Equipment Vaildate`);

	if (config.equipmentChecks.equipmentCheck1.enabled && packet.slot > 8 || packet.selected_slot > 8) {
		console.log(`[${dbAccount.xuid}] Bad equipment [T1]`);
		if (!config.debug) {
			if (config.equipmentChecks.equipmentCheck1.punishment === "kick") {
				client.sendCommand(`kick "${dbAccount.xuid}" Invaild equipment information sent. (0x8a1)`, 0)
				dbAccount.kickCount++
				dbAccount.save()
			} else if (config.equipmentChecks.equipmentCheck1.punishment === "ban") {
				client.sendCommand(`kick "${dbAccount.xuid}" Invaild equipment information sent. (0x8a1)`, 0)
				dbAccount.banCount++
				dbAccount.isBanned = true
				dbAccount.save()
			} else if (config.equipmentChecks.equipmentCheck1.punishment === "clubKick" && client.realm.isOwner) {
				client.realm.kick(dbAccount.xuid);
				dbAccount.clubKickCount++
				dbAccount.save()
			} else if (config.equipmentChecks.equipmentCheck1.punishment === "clubBan" && client.realm.isOwner) {
				client.realm.ban(dbAccount.xuid);
				dbAccount.clubBanCount++
				dbAccount.save()
			} else if (config.equipmentChecks.equipmentCheck1.punishment === "warning") {
				client.sendCommand(`say "${dbAccount.xuid}" You sent invaild equipment information. (0x8a1)`, 0)
				dbAccount.warningCount++
				dbAccount.save()
			}
		}
	}
}

module.exports = {
	equipmentVaildate: equipmentVaildate
};