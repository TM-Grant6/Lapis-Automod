const {
	createClient
} = require("bedrock-protocol");

const {
	accountsModel
} = require("./database.js");

const {
	v4: uuidv4
} = require("uuid");

// File Imports
const config = require("./config.json");

const fs = require('fs');
const chalk = require("chalk");

const {
	generateRandomString,
	getDeviceId,
	getInputMode,
	getProtocolVersion
} = require("./util.js");

const {
	getXboxAccountDataBulk
} = require("./xbox.js");

const {
	skinVaildate
} = require("./modules/skin.js");

const {
	deviceVaildate
} = require("./modules/device.js");

const {
	emoteVaildate
} = require("./modules/emote.js");

const {
	animateVaildate
} = require("./modules/animate.js");

const {
	equipmentVaildate
} = require("./modules/equipment.js");

const {
	apiVaildate
} = require("./modules/api.js");

const {
	textVaildate
} = require("./modules/text.js");

const {
	handleFunctions,
	handleRejoin
} = require("./handler.js");

module.exports.moderate = async (realmData) => {
	if (config.debug) console.log(chalk.yellow(`---> Debug mode is enabled. \n+--> No players will be kicked or punished.\n+--> Debugging logs are enabled`));

	if (config.debug === false) {
		console.log(chalk.green('---> Joining the realm'));
	} else {
		console.log(chalk.green('----> Joining the realm'));
	}

	let options = {
		host: realmData.ip,
		port: realmData.port,
		profilesFolder: "./authCache",
		skipPing: true,
		skinData: {
			CurrentInputMode: getInputMode(config.clientOptions.deviceOS),
			DefaultInputMode: getInputMode(config.clientOptions.deviceOS),
			DeviceId: getDeviceId(config.clientOptions.deviceOS),
			DeviceModel: 'xbox_series_x',
			DeviceOS: config.clientOptions.deviceOS,
			PlatformOnlineId: (config.clientOptions.deviceOS === 12) ? generateRandomString(19, "1234567890") : "",
			PlatformUserId: (config.clientOptions.deviceOS === 12) ? uuidv4() : "",
			PlayFabId: generateRandomString(16, "qwertyuiopasdfghjklzxcvbnm12345678901")
		}
	}

	const client = createClient(options);

	if (config.clientOptions.getLatestProtocolVersion === true) {
		client.options.protocolVersion = await getProtocolVersion();
	} else if (typeof config.clientOptions.protocolVersion === "number") {
		client.options.protocolVersion = config.clientOptions.protocolVersion;
	} else {
		return;
	}

	handleFunctions(client);

	let wasKicked;

	client.on("kick", async (data) => {
		wasKicked = true;

		console.log(chalk.red(`+--> Triggered! ${JSON.stringify(data)}`));

		if (config.clientOptions.automaticRealmRejoining === true) setTimeout(async () => {
			await handleRejoin(realmData);
		}, config.clientOptions.rejoinTimeout);
	});

	client.on("error", async (error) => {
		if (wasKicked) return;

		console.error(chalk.red(error))

		client.emit("kick", {
			message: String(error)
		});

		if (config.clientOptions.automaticRealmRejoining === true) setTimeout(async () => {
			await handleRejoin(realmData);
		}, config.clientOptions.rejoinTimeout);
	});

	client.on("close", async () => {
		if (wasKicked) return;

		client.emit("kick", {
			message: "+--> Lost connection to server"
		});

		if (config.clientOptions.automaticRealmRejoining === true) setTimeout(async () => {
			await handleRejoin(realmData);
		}, config.clientOptions.rejoinTimeout);
	});

	process.on("warning", (warning) => {
		console.warn(chalk.red(warning));
	});

	process.on("unhandledRejection", (error) => {
		new Error(chalk.red(error));
	});

	process.on("uncaughtException", (error, origin) => {
		console.error(chalk.red(`+--> Error has occured: ${error}. Origin of error: ${origin}`));
	});

	const userMap = {};
	let runtimeIds = [];

	client.on("player_list", async (packet) => {
		if (packet.records.type === "remove") return;

		const records = packet.records.records;

		const xuids = [];

		for (const player of records) {
			const {
				xbox_user_id: xuid
			} = player;

			if (
				client.profile.xuid === xuid ||
				xuid?.length !== 16 ||
				!xuid?.startsWith("2")
			) continue;

			userMap[player.username] = xuid;

			xuids.push(xuid);

			getXboxAccountDataBulk(xuids);

			const dbAccount = await accountsModel.findOne({
				xuid: xuid
			});

			if (!dbAccount) {
				if (config.debug === true) console.log(`[${xuid}] No account linked. (plrList)`)
				getXboxAccountDataBulk(xuid);

				if (config.clientOptions.lapisOptions.enableSkinHandler === true) skinVaildate(player, null, client, "playerList");
				if (config.clientOptions.lapisOptions.enableDeviceHandler === true) deviceVaildate(player, null, client, "playerList");
				if (config.clientOptions.lapisOptions.enableAPIHandler === true) apiVaildate(player, client, realmData);
			};

			if (dbAccount) {
				if (config.clientOptions.lapisOptions.enableSkinHandler === true) skinVaildate(player, dbAccount, client, "playerList");
				if (config.clientOptions.lapisOptions.enableDeviceHandler === true) deviceVaildate(player, dbAccount, client, "playerList");
				if (config.clientOptions.lapisOptions.enableAPIHandler === true) apiVaildate(player, client, realmData);
				if (config.debug === true) console.log(`Had DB History`);
			}
		}
	});

	client.on("add_player", async (packet) => {
		const {
			username,
			device_id,
			device_os,
			uuid,
			runtime_id,
			permission_level,
			gamemode
		} = packet;

		console.log(`[${username}] Joined on ${device_os} (${device_id}) Runtime ID: ${runtime_id}`)

		const xuid = userMap[username];

		if (
			client.profile.xuid === xuid ||
			xuid?.length !== 16 ||
			!xuid?.startsWith("2")
		) return;

		const dbAccount = await accountsModel.findOne({
			xuid: xuid
		});

		if (!dbAccount) {
			getXboxAccountDataBulk(xuid);
		};

		if (config.clientOptions.lapisOptions.enableDeviceHandler === true) await deviceVaildate(packet, dbAccount, client, "playerAdd");

		if (!dbAccount.deviceOs) dbAccount.deviceOs = [];

		if (!dbAccount.deviceIds.includes(device_id)) dbAccount.deviceIds.push(device_id);

		if (!dbAccount.deviceOs.includes(device_os) && !/^[a-zA-Z]+$/.test(device_os)) dbAccount.deviceOs.push(device_os);

		if (!dbAccount.xboxUUID) dbAccount.xboxUUID = uuid;

		if (!dbAccount.runtimeID) dbAccount.runtimeID = 0n;

		if (!dbAccount.permission) dbAccount.permission = 'member';

		if (!dbAccount.currentGamertag) dbAccount.currentGamertag = username;

		if (!dbAccount.currentGamemode) dbAccount.currentGamemode = gamemode;

		if (!dbAccount.currentDevice) dbAccount.currentDevice = device_os;

		// These will need automatic updating...
		dbAccount.runtimeID = runtime_id;

		dbAccount.permission = permission_level;

		dbAccount.currentGamertag = username;

		dbAccount.currentGamemode = gamemode;

		if (!/^[a-zA-Z]+$/.test(device_os)) dbAccount.currentDevice = device_os;

		dbAccount.save();

		if (runtimeIds.find(item => item.runtime_id === runtime_id)) return;

		runtimeIds.push({
			type: "player",
			runtime_id: runtime_id
		});
	});

	client.on("add_entity", (packet) => {
		const { runtime_id } = packet;

		if (runtimeIds.find(item => item.runtime_id === runtime_id)) return;

		runtimeIds.push({
			type: "entity",
			runtime_id: runtime_id
		});
	});

	if (config.clientOptions.lapisOptions.enableSkinHandler === true) {
		client.on('player_skin', async (packet) => {
			const dbAccount = await accountsModel.findOne({
				xboxUUID: packet.uuid
			});

			if (!dbAccount) {
				console.log(`No account linked. We can't detect anything bad if it's not in the DB.`);
				return;
			};

			if (dbAccount) skinVaildate(packet, dbAccount, client, "playerSkin");
		})
	} else {
		return;
	}

	if (config.clientOptions.lapisOptions.enableEmoteHandler === true) {
		client.on('emote', async (packet) => {
			const dbAccount = await accountsModel.findOne({
				xuid: packet.xuid
			});

			if (!dbAccount) {
				getXboxAccountDataBulk(packet.xuid);
				return;
			};

			if (dbAccount) emoteVaildate(packet, dbAccount, client);
		})
	} else {
		return;
	}

	if (config.clientOptions.lapisOptions.enableTextHandler === true) {
		client.on('text', async (packet) => {
			const dbAccount = await accountsModel.findOne({
				xuid: packet.xuid
			});

			if (!dbAccount) {
				getXboxAccountDataBulk(packet.xuid);
				return;
			};

			if (dbAccount) textVaildate(packet, dbAccount, client);
		})
	} else {
		return;
	}

	if (config.clientOptions.lapisOptions.enableAnimateHandler === true) {
		client.on('animate', async (packet) => {
			for (let id of runtimeIds) {
				if (id.runtime_id === packet.runtime_entity_id) {
					const dbAccount = await accountsModel.findOne({
						runtimeID: packet.runtime_entity_id
					});

					if (!dbAccount) return;

					animateVaildate(packet, dbAccount, client);
				}
			}
		});
	} else {
		return;
	}

	if (config.clientOptions.lapisOptions.enableEquipmentHandler === true) {
		client.on('mob_equipment', async (packet) => {
			for (let id of runtimeIds) {
				if (id.runtime_id === packet.runtime_entity_id) {
					const dbAccount = await accountsModel.findOne({
						runtimeID: packet.runtime_entity_id
					});

					if (!dbAccount) return;

					equipmentVaildate(packet, dbAccount, client);
				}
			}
		})
	} else {
		return;
	}

	client.on('start_game', async (packet) => {
		if (config.debug === false) {
			console.log(chalk.greenBright('----> Joined the realm'));
		} else {
			console.log(chalk.greenBright('-----> Joined the realm'));
		}

		// Make the bot have god mode if anyone tries hitting it
		setInterval(() => {
			client.sendCommand(`effect @s health_boost 30 255 true`, 0);
			client.sendCommand(`effect @s instant_health 30 255 true`, 0)
		}, 5000)
	})
}