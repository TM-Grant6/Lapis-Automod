const {
	accountsModel
} = require("../database.js");

const {
	isUUIDv3,
	isUUIDv4WithoutDashes,
	isUUIDv5,
	isValidPlatformChatId
} = require("../util.js");

async function deviceVaildate(packet, dbAccount, client, packetType) {
	if (packetType === "playerList") {
		if (packet.build_platform != 12 && packet.platform_chat_id.length != 0) {
			console.log(`[${packet.xbox_user_id}] Not on NintendoSwitch & has Platform Chat ID [T7]`);
			client.sendCommand(`kick ${packet.xbox_user_id} Invaild information sent. [T7]`, 0)
		}

		if (!isValidPlatformChatId(packet.platform_chat_id) && packet.build_platform === 12) {
			console.log(`[${packet.xbox_user_id}] Invaild Platform Chat ID [T8]`);
			client.sendCommand(`kick ${packet.xbox_user_id} Invaild information sent. [T8]`, 0)
		}
	} else if (packetType === "playerAdd") {
		const {
			device_id
		} = packet;



		const accounts = await accountsModel.find({}).exec();

		accounts.forEach(dbAccount => {
			const linkedDeviceIds = dbAccount.deviceIds;
			const gamertags = dbAccount.gamertags;
			const lastGamertag = gamertags[gamertags.length - 1];

			if (linkedDeviceIds && Array.isArray(linkedDeviceIds)) {
				if (linkedDeviceIds.length > 4 && lastGamertag === packet.username) {
					console.log(`[${dbAccount.xuid}] Had too many Device IDs. [T1]`);
					client.sendCommand(`kick "${dbAccount.xuid}" You have been on this realm on too many device. [T1]`);

					return;
				}

				linkedDeviceIds.forEach(linkedDeviceId => {
					if (linkedDeviceId === device_id) {
						if (lastGamertag === packet.username) return;

						console.log(`[${dbAccount.xuid}] Had a duplicate Device ID(s). Last account was: ${lastGamertag}.`);
						client.sendCommand(`kick "${dbAccount.xuid}" You had a account joined already. (Last Account: §b${lastGamertag}§r) [T2]`);
					}
				});
			}
		});

		if (dbAccount.deviceOs.length > 4) {
			console.log(`[${dbAccount.xuid}] Had too many device types in the database [T3].`);
			client.sendCommand(`kick "${dbAccount.xuid}" You have been on this realm on too many devices. [T3]`);
			return;
		}

		let lastDeviceId = dbAccount.deviceIds[dbAccount.deviceIds.length - 1];
		let lastDeviceOs = dbAccount.deviceOs[dbAccount.deviceOs.length - 1];

		switch (lastDeviceOs) {
			case "Xbox":
				if (!lastDeviceId.endsWith("=")) {
					console.log(`[${dbAccount.xuid}] User on Xbox without the right Device ID. [T4]`);
					client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. [T4]`);
					return;
				}

				break;
			case "Android":
				if (!isUUIDv4WithoutDashes(lastDeviceId)) {
					console.log(`[${dbAccount.xuid}] User on Android without the right Device ID. [T4]`);
					client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. [T4]`);
					return;
				}

				break;
			case "IOS":
				if (!isUUIDv4WithoutDashes(lastDeviceId) && /^[A-Z0-9]{32}$/.test(lastDeviceId)) {
					console.log(`[${dbAccount.xuid}] User on iOS without the right Device ID. [T4]`);
					client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. [T4]`);
					return;
				}

				break;
			case "Orbis":
			case "Win10":
			case "Win32":
				if (!isUUIDv3(lastDeviceId)) {
					console.log(`[${dbAccount.xuid}] User with the wrong Device ID. [T4]`);
					client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. [T4]`);
					return;
				}

				break;
			case "NintendoSwitch":
				if (!isUUIDv5(lastDeviceId)) {
					console.log(`[${dbAccount.xuid}] User on Nintendo Switch with the wrong Device ID. [T4]`);
					client.sendCommand(`kick "${dbAccount.xuid}" Invalid ID. [T4]`);
					return;
				}

				if (!isValidPlatformChatId(packet.platform_chat_id)) {
					console.log(`[${dbAccount.xuid}] No Platform Chat ID [T5]`);
					client.sendCommand(`kick "${dbAccount.xuid}" Invaild information sent. [T5]`, 0)
				}

				break;
		}

		if (lastDeviceOs === "Unknown" || lastDeviceOs === "Dedicated" || lastDeviceOs === "Linux") {
			console.log(`[${dbAccount.xuid}] Unsupported device [T6]`);
			client.sendCommand(`kick "${dbAccount.xuid}" Unsupported device model. [T6]`);
			return;
		}

		if (packet.device_os != 'NintendoSwitch' && packet.platform_chat_id.length != 0) {
			console.log(`[${dbAccount.xuid}] Not on NintendoSwitch & has Platform Chat ID [T7]`);
			client.sendCommand(`kick "${dbAccount.xuid}" Invaild information sent. [T7]`, 0)
		}
	}
}

module.exports = {
	deviceVaildate: deviceVaildate
};
