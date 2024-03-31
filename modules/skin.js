const config = require("../config.json");

function skinVaildate(packet, dbAccount, client, packetType) {
	if (config.debug) console.log(`Skin Vaildate`);

	if (packetType === "playerList") {
		if (config.skinChecks.skinCheck1.enabled && !packet.skin_data.skin_id.includes(packet.skin_data.play_fab_id)) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T1]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent.\nThis could be because\n- You haven't connected to PlayFab API correctly.\n- You are using classic skin (Change skin)\nTry relaunching Minecraft to fix this. (0x3f3)`, 0)
		}

		if (config.skinChecks.skinCheck2.enabled && packet.skin_data.full_skin_id != packet.skin_data.skin_id) {
			console.log(`[${packet.xbox_user_id}] Full Skin ID & Skin ID do not match. [T2]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent. (0x3f4)`, 0)
		}

		if (config.skinChecks.skinCheck3.enabled && packet.skin_data.skin_data.width > 512 || packet.skin_data.skin_data.width < 64) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T3]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent. (0x3f5)`, 0)
		}

		if (config.skinChecks.skinCheck4.enabled && packet.skin_data.skin_data.height > 512 || packet.skin_data.skin_data.height < 64) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T4]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent. (0x3f6)`, 0)
		}

		if (config.skinChecks.skinCheck5.enabled && !packet.skin_data.skin_resource_pack.includes(packet.skin_data.play_fab_id)) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T5]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent.\nThis could be because\n- You haven't connected to PlayFab API correctly.\n- You are using classic skin (Change skin)\nTry relaunching Minecraft to fix this. (0x3f7)`, 0)
		}

		if (config.skinChecks.skinCheck6.enabled && packet.skin_data.play_fab_id > 16 || packet.skin_data.play_fab_id < 16) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T6]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent. (0x3f8)`, 0)
		}

		if (config.skinChecks.skinCheck7.enabled && packet.skin_data.premium && packet.skin_data.skin_resource_pack.includes('"default" : "geometry.n3"\n') || packet.skin_data.skin_id.includes('#')) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T7]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent.\nThis could be because you are using a custom skin.\nTry changing to steve. (0x3f9)`, 0)
		}

		if (config.skinChecks.skinCheck8.enabled)
			if (
				!packet.skin_data.skin_resource_pack.includes(packet.skin_data.play_fab_id) ||
				!packet.skin_data.skin_id.includes(packet.skin_data.play_fab_id) ||
				!packet.skin_data.full_skin_id.includes(packet.skin_data.play_fab_id) ||
				!packet.skin_data.geometry_data.includes(packet.skin_data.play_fab_id)) {
				console.log(`[${packet.xbox_user_id}] Bad skin information [T8]`);
				if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent.\nThis could be because\n- You haven't connected to PlayFab API correctly.\n- You are using classic skin (Change skin)\nTry relaunching Minecraft to fix this. (0x3f11)`, 0);
			}

		if (config.skinChecks.skinCheck9.enabled && packet.skin_data.geometry_data_version.length < 5 || packet.skin_data.geometry_data_version.length > 6) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T9]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent. (0x3f11)`, 0)
		}

		if (config.skinChecks.skinCheck10.enabled && packet.skin_data.skin_resource_pack.includes(' "default" : "geometry.humanoid"\n')) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T10]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent.\nThis could be becuase\nYou are wearing a corrupt skin or invisible skin.\nTry changing skins to fix this. (0x3f12)`, 0)
		}

		if (config.skinChecks.skinCheck11.enabled && !packet.skin_data.skin_resource_pack.includes("default")) {
			console.log(`[${packet.xbox_user_id}] Bad skin information [T11]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild skin information sent.\nThis could be becuase\nYou are wearing a corrupt skin.\nTry changing skins to fix this. (0x3f13)`, 0)
		}
	} else if (packetType === "playerSkin") {
		if (config.skinChecks.skinCheck1.enabled && !packet.skin.skin_id.includes(packet.skin.play_fab_id)) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T1]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent.\nThis could be because\n- You are using classic skin (Change skin)\nTry relaunching Minecraft to fix this. (0x5d1)`, 0)
		}

		if (config.skinChecks.skinCheck2.enabled && packet.skin.full_skin_id != packet.skin.skin_id) {
			console.log(`[${dbAccount.xuid}] Full Skin ID & Skin ID do not match. [T2]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent. (0x5d2)`, 0)
		}

		if (config.skinChecks.skinCheck3.enabled && packet.skin.skin_data.width > 512 || packet.skin.skin_data.width < 64) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T3]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent. (0x5d3)`, 0)
		}

		if (config.skinChecks.skinCheck4.enabled && packet.skin.skin_data.height > 512 || packet.skin.skin_data.height < 64) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T4]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent. (0x5d4)`, 0)
		}

		if (config.skinChecks.skinCheck5.enabled && !packet.skin.skin_resource_pack.includes(packet.skin.play_fab_id)) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T5]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent.\nThis could be because\n- You are using classic skin (Change skin)\nTry relaunching Minecraft to fix this. (0x5d5)`, 0)
		}

		if (config.skinChecks.skinCheck6.enabled && packet.skin.play_fab_id > 16 || packet.skin.play_fab_id < 16) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T6]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent.\nThis could be because you are using classic skin. (Change skin) (0x5d6)`, 0)
		}

		if (config.skinChecks.skinCheck7.enabled && packet.skin.premium && packet.skin.skin_resource_pack.includes('"default" : "geometry.n3"\n') || packet.skin.skin_id.includes('#')) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T7]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent.\nThis could be because you are using a custom skin.\nTry changing to steve. (0x5d7)`, 0)
		}

		if (config.skinChecks.skinCheck8.enabled)
			if (
				!packet.skin.skin_resource_pack.includes(packet.skin.play_fab_id) ||
				!packet.skin.skin_id.includes(packet.skin.play_fab_id) ||
				!packet.skin.full_skin_id.includes(packet.skin.play_fab_id) ||
				!packet.skin.geometry_data.includes(packet.skin.play_fab_id)) {
				console.log(`[${dbAccount.xuid}] Bad skin information [T8]`);
				if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent.\nThis could be because\n- You are using classic skin (Change skin)\nTry relaunching Minecraft to fix this. (0x5d9)`, 0);
			}

		if (config.skinChecks.skinCheck10.enabled && packet.skin.skin_resource_pack.includes(' "default" : "geometry.humanoid"\n')) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T9]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent.\nThis could be becuase\nYou are wearing a corrupt skin or invisible skin.\nTry changing skins to fix this. (0x5d10)`, 0)
		}

		if (config.skinChecks.skinCheck11.enabled && !packet.skin.skin_resource_pack.includes("default")) {
			console.log(`[${dbAccount.xuid}] Bad skin information [T10]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild skin information sent.\nThis could be becuase\nYou are wearing a corrupt skin.\nTry changing skins to fix this. (0x5d11)`, 0)
		}
	} else {
		console.log(`Packet type: ${packetType} is not vaild. Failed to do any checks.`);
	}
}

module.exports = {
	skinVaildate: skinVaildate
};