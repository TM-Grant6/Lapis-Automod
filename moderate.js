const {
    Client
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

const {
    generateRandomString,
    getDeviceId,
    getInputMode,
    isUUIDv3,
    isUUIDv4,
    isUUIDv4WithoutDashes,
    isUUIDv5,
    isValidPlatformChatId
} = require("./util.js");

const {
    getXboxAccountDataBulk
} = require("./xbox.js");

const {
    handleFunctions
} = require("./handler.js");

module.exports.moderate = async (realmData) => {
    let options = {
        host: realmData.ip,
        port: realmData.port,
        profilesFolder: "./authCache",
        skipPing: true,
        skinData: {
            CurrentInputMode: getInputMode(config.deviceOS),
            DefaultInputMode: getInputMode(config.deviceOS),
            DeviceId: getDeviceId(config.deviceOS),
            DeviceModel: 'Lapis',
            DeviceOS: config.deviceOS,
            PlatformOnlineId: (config.deviceOS === 12) ? generateRandomString(19, "1234567890") : "",
            PlatformUserId: (config.deviceOS === 12) ? uuidv4() : "",
            PlayFabId: generateRandomString(16, "qwertyuiopasdfghjklzxcvbnm12345678901")
        }
    }

    const client = new Client({
        ...options
    });

    handleFunctions(client);

    client.connect();

    client.once('resource_packs_info', async () => {
        client.write('resource_pack_client_response', {
            response_status: 'completed',
            resourcepackids: []
        })
    })

    const userMap = {};

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
                !xuid?.startsWith("2") ||
                userMap[player.username]
            ) continue;

            userMap[player.username] = xuid;

            xuids.push(xuid);

            getXboxAccountDataBulk(xuids);

            if (!player.skin_data.skin_id.includes(player.skin_data.play_fab_id)) {
                console.log(`[${player.xbox_user_id}] Bad skin information [T1]`);
                client.sendCommand(`kick "${player.xbox_user_id}" Invaild skin information sent.\nThis could be because you haven't connected to PlayFab API correctly. Try relaunching Minecraft. [T1]`, 0)
            }

            if (player.skin_data.full_skin_id != player.skin_data.skin_id) {
                console.log(`[${player.xbox_user_id}] Full Skin ID & Skin ID do not match. [T2]`);
                client.sendCommand(`kick "${player.xbox_user_id}" Invaild skin information sent. [T2]`, 0)
            }

            if (player.skin_data.skin_data.width > 512 || player.skin_data.skin_data.width < 256) {
                console.log(`[${player.xbox_user_id}] Bad skin information [T3]`);
                client.sendCommand(`kick "${player.xbox_user_id}" Invaild skin information sent. [T3]`, 0)
            }

            if (player.skin_data.skin_data.height > 512 || player.skin_data.skin_data.height < 256) {
                console.log(`[${player.xbox_user_id}] Bad skin information [T4]`);
                client.sendCommand(`kick "${player.xbox_user_id}" Invaild skin information sent. [T4]`, 0)
            }

            if (!player.skin_data.skin_resource_pack.includes(player.skin_data.play_fab_id)) {
                console.log(`[${player.xbox_user_id}] Bad skin information [T5]`);
                client.sendCommand(`kick "${player.xbox_user_id}" Invaild skin information sent.\nThis could be because you haven't connected to PlayFab API correctly. Try relaunching Minecraft. [T5]`, 0)
            }

            if (player.skin_data.play_fab_id > 16) {
                console.log(`[${player.xbox_user_id}] Bad skin information [T6]`);
                client.sendCommand(`kick "${player.xbox_user_id}" Invaild skin information sent. [T6]`, 0)
            }

            if (player.build_platform != 12 && player.platform_chat_id.length != 0) {
                console.log(`[${player.xbox_user_id}] Not on NintendoSwitch & has Platform Chat ID [T7]`);
                client.sendCommand(`kick ${player.xbox_user_id} Invaild information sent. [T7]`, 0)
            }

            if (!isValidPlatformChatId(player.platform_chat_id) && player.build_platform === 12) {
                console.log(`[${player.xbox_user_id}] Invaild Platform Chat ID [T8]`);
                client.sendCommand(`kick ${player.xbox_user_id} Invaild information sent. [T8]`, 0)
            }
        }

        const dbAccount = await accountsModel.findOne({
            xuid: records.xbox_user_id
        });

        if (!dbAccount) return;
    });

    client.on("add_player", async (packet) => {
        const {
            username,
            device_id,
            device_os
        } = packet;

        console.log(JSON.stringify(packet, (key, value) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        }))

        const xuid = userMap[username];

        if (
            client.profile.xuid === xuid ||
            xuid?.length !== 16 ||
            !xuid?.startsWith("2")
        ) return;

        const dbAccount = await accountsModel.findOne({
            xuid: xuid
        });

        if (!dbAccount) return;

        const accounts = await accountsModel.find({}).exec();

        accounts.forEach(dbAccount => {
            const linkedDeviceIds = dbAccount.deviceIds;
            const gamertags = dbAccount.gamertags;
            const lastGamertag = gamertags[gamertags.length - 1];

            if (linkedDeviceIds && Array.isArray(linkedDeviceIds)) {
                if (linkedDeviceIds.length > 4 && lastGamertag === packet.username) {
                    console.log(`[${xuid}] Had too many Device IDs. [T1]`);
                    client.sendCommand(`kick "${xuid}" You have been on this realm on too many device. [T1]`);

                    return;
                }

                linkedDeviceIds.forEach(linkedDeviceId => {
                    if (linkedDeviceId === device_id) {
                        if (lastGamertag === packet.username) return;

                        console.log(`[${xuid}] Had a duplicate Device ID(s). Last account was: ${lastGamertag}.`);
                        client.sendCommand(`kick "${xuid}" You had a account joined already. (Last Account: §b${lastGamertag}§r) [T2]`);
                    }
                });
            }
        });

        if (!dbAccount.deviceOs) dbAccount.deviceOs = [];

        if (!dbAccount.deviceIds.includes(device_id)) dbAccount.deviceIds.push(device_id);

        if (!dbAccount.deviceOs.includes(device_os)) dbAccount.deviceOs.push(device_os);

        dbAccount.save();

        if (dbAccount.deviceOs.length > 4) {
            console.log(`[${xuid}] Had too many device types in the database [T3].`);
            client.sendCommand(`kick "${xuid}" You have been on this realm on too many devices. [T3]`);
            return;
        }

        let lastDeviceId = dbAccount.deviceIds[dbAccount.deviceIds.length - 1];
        let lastDeviceOs = dbAccount.deviceOs[dbAccount.deviceOs.length - 1];

        switch (lastDeviceOs) {
            case "Xbox":
                if (!lastDeviceId.endsWith("=")) {
                    console.log(`[${xuid}] User on Xbox without the right Device ID. [T4]`);
                    client.sendCommand(`kick "${xuid}" Invalid ID. [T4]`);
                    return;
                }

                break;
            case "Android":
                if (!isUUIDv4WithoutDashes(lastDeviceId)) {
                    console.log(`[${xuid}] User on Android without the right Device ID. [T4]`);
                    client.sendCommand(`kick "${xuid}" Invalid ID. [T4]`);
                    return;
                }

                break;
            case "IOS":
                if (!isUUIDv4WithoutDashes(lastDeviceId) && /^[A-Z0-9]{32}$/.test(lastDeviceId)) {
                    console.log(`[${xuid}] User on iOS without the right Device ID. [T4]`);
                    client.sendCommand(`kick "${xuid}" Invalid ID. [T4]`);
                    return;
                }

                break;
            case "Orbis":
            case "Win10":
            case "Win32":
                if (!isUUIDv3(lastDeviceId)) {
                    console.log(`[${xuid}] User with the wrong Device ID. [T4]`);
                    client.sendCommand(`kick "${xuid}" Invalid ID. [T4]`);
                    return;
                }

                break;
            case "NintendoSwitch":
                if (!isUUIDv5(lastDeviceId)) {
                    console.log(`[${xuid}] User on Nintendo Switch with the wrong Device ID. [T4]`);
                    client.sendCommand(`kick "${xuid}" Invalid ID. [T4]`);
                    return;
                }

                if (!isValidPlatformChatId(packet.platform_chat_id)) {
                    console.log(`[${xuid}] No Platform Chat ID [T5]`);
                    client.sendCommand(`kick ${xuid} Invaild information sent. [T5]`, 0)
                }

                break;
        }

        if (lastDeviceOs === "Unknown" || lastDeviceOs === "Dedicated" || lastDeviceOs === "Linux") {
            console.log(`[${xuid}] Unsupported device [T6]`);
            client.sendCommand(`kick "${xuid}" Unsupported device model. [T6]`);
            return;
        }

        if (packet.device_os != 'NintendoSwitch' && packet.platform_chat_id.length != 0) {
            console.log(`[${xuid}] Not on NintendoSwitch & has Platform Chat ID [T7]`);
            client.sendCommand(`kick ${xuid} Invaild information sent. [T7]`, 0)
        }
    });

    client.on('start_game', async () => {
        console.log(`Joined`);

        let wasKicked;

        client.on("kick", (data) => {
            wasKicked = true;

            console.log(`Triggered! ${JSON.stringify(data)}`);

            process.exit(1);
        });

        client.on("error", (error) => {
            if (wasKicked) return;

            client.emit("kick", {
                message: String(error)
            });

            process.exit(1);
        });

        client.on("close", () => {
            if (wasKicked) return;

            client.emit("kick", {
                message: "Lost connection to server"
            });

            process.exit(1);
        });

        process.on("warning", (warning) => {
            console.warn(warning);
        });

        process.on("unhandledRejection", (error) => {
            console.error(error);
        });

        process.on("uncaughtException", (error, origin) => {
            console.error(error);
        });
    })
}
