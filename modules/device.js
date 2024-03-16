const {
	accountsModel
} = require("../database.js");

const {
	isUUIDv3,
	isUUIDv4WithoutDashes,
	isUUIDv5,
	isValidPlatformChatId
} = require("../util.js");

const config = require("../config.json");

async function deviceVaildate(packet, dbAccount, client, packetType) {
	if (config.debug === true) console.log(`Device Vaildate`);

	if (packetType === "playerList") {
		if (config.deviceChecks.deviceCheck1.enabled === true && packet.build_platform != 12 && packet.platform_chat_id.length != 0) {
			console.log(`[${packet.xbox_user_id}] Not on NintendoSwitch & has Platform Chat ID. [T1]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild information sent. (0x3f1)`, 0)
		}

		if (config.deviceChecks.deviceCheck2.enabled === true && !isValidPlatformChatId(packet.platform_chat_id) && packet.build_platform === 12) {
			console.log(`[${packet.xbox_user_id}] Invaild Platform Chat ID. [T2]`);
			if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild information sent. (0x3f2)`, 0)
		}
	} else if (packetType === "playerAdd") {
		const {
			device_id,
			device_os
		} = packet;

		const accounts = await accountsModel.find({}).exec();

		accounts.forEach(dbAccount2 => {
			const linkedDeviceIds = dbAccount2.deviceIds;
			const gamertags = dbAccount2.gamertags;
			const lastGamertag = gamertags[gamertags.length - 1];

			if (linkedDeviceIds && Array.isArray(linkedDeviceIds)) {
				if (config.deviceChecks.deviceCheck3.enabled === true && linkedDeviceIds.length > 4 && lastGamertag === packet.username) {
					console.log(`[${dbAccount.xuid}] Had too many Device IDs. [T3]`);
					if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" You have been on this realm on too many device. (0xc1)`, 0);
				}

				linkedDeviceIds.forEach(linkedDeviceId => {
					if (config.deviceChecks.deviceCheck4.enabled === true && linkedDeviceId === device_id) {
						if (lastGamertag === packet.username) return;

						console.log(`[${dbAccount.xuid}] Had a duplicate Device ID(s). Last account was: ${lastGamertag}. [T4]`);
						if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" You had a account joined already. (Last Account: §b${lastGamertag}§r) (0xc2)`, 0);
					}
				});
			}
		});

		if (config.deviceChecks.deviceCheck5.enabled === true && dbAccount.deviceOs.length > 4) {
			console.log(`[${dbAccount.xuid}] Had too many device types in the database. [T5]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" You have been on this realm on too many devices. (0xc3)`, 0);
			return;
		}

		switch (device_os) {
			case "Xbox":
				if (config.deviceChecks.deviceCheck6.enabled === true && !device_id.endsWith("=")) {
					console.log(`[${dbAccount.xuid}] User on Xbox without the right Device ID. [T6]`);
					if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. (0xc4)`, 0);
					return;
				}

				break;
			case "Android":
				if (config.deviceChecks.deviceCheck6.enabled === true && !isUUIDv4WithoutDashes(device_id)) {
					console.log(`[${dbAccount.xuid}] User on Android without the right Device ID. [T6]`);
					if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. (0xc4)`, 0);
					return;
				}

				break;
			case "IOS":
				if (config.deviceChecks.deviceCheck6.enabled === true && !isUUIDv4WithoutDashes(device_id) && /^[A-Z0-9]{32}$/.test(device_id)) {
					console.log(`[${dbAccount.xuid}] User on iOS without the right Device ID. [T6]`);
					if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. (0xc4)`, 0);
					return;
				}

				break;
			case "Orbis":
			case "Win10":
			case "Win32":
				if (config.deviceChecks.deviceCheck6.enabled === true && !isUUIDv3(device_id)) {
					console.log(`[${dbAccount.xuid}] User with the wrong Device ID. [T6]`);
					if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. (0xc4)`, 0);
					return;
				}

				break;
			case "NintendoSwitch":
				if (config.deviceChecks.deviceCheck6.enabled === true && !isUUIDv5(device_id)) {
					console.log(`[${dbAccount.xuid}] User on Nintendo Switch with the wrong Device ID. [T6]`);
					if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. (0xc4)`, 0);
					return;
				}

				if (config.deviceChecks.deviceCheck2.enabled === true && !isValidPlatformChatId(packet.platform_chat_id)) {
					console.log(`[${dbAccount.xuid}] Invaild Platform Chat ID. [T2]`);
					if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild information sent. (0xc5)`, 0)
				}

				break;
		}

		if (config.deviceChecks.deviceCheck7.enabled === true && device_os === "Unknown" || device_os === "Dedicated" || device_os === "Linux") {
			console.log(`[${dbAccount.xuid}] Unsupported device. [T7]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Unsupported device model. (0xc6)`, 0);
			return;
		}

		if (config.deviceChecks.deviceCheck1.enabled === true && device_os != 'NintendoSwitch' && packet.platform_chat_id.length != 0) {
			console.log(`[${dbAccount.xuid}] Not on NintendoSwitch & has Platform Chat ID. [T1]`);
			if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild information sent. (0xc7)`, 0)
		}
	} else {
		console.log(`Packet type: ${packetType} is not vaild. Failed to do any checks.`);
	}
}

module.exports = {
	deviceVaildate: deviceVaildate
};
