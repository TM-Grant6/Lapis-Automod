const config = require("../config.json");

const { isValidPlatformChatId } = require("../util.js");

const { getXboxUserData } = require("../xbox.js");

async function textVaildate(packet, dbAccount, client) {
    if (packet.type === 'translation') return;
	if (config.debug === true) console.log(`Text Vaildate`);

    const profile = await getXboxUserData(dbAccount.xuid);

	if (config.textChecks.textCheck1.enabled === true && packet.message.includes('* External')) {
		console.log(`[${packet.xuid}] External Message [T1]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x91)`, 0);
	}

    if (config.textChecks.textCheck2.enabled === true && packet.needs_translation === true && packet.type === 'chat' || packet.type === 'whisper') {
        console.log(`[${packet.xuid}] Bad Message [T2]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x92)`, 0);
    }

    if (config.textChecks.textCheck3.enabled === true && packet.platform_chat_id.length >= 1 && !isValidPlatformChatId(packet.platform_chat_id)) {
        console.log(`[${packet.xuid}] Bad Message [T3]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x93)`, 0);
    }

    if (config.textChecks.textCheck4.enabled === true && packet.platform_chat_id.length >= 1 && dbAccount.currentDevice != 'NintendoSwitch') {
        console.log(`[${packet.xuid}] Bad Message [T4]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x94)`, 0);
    }

    if (config.textChecks.textCheck5.enabled === true && packet.source_name != profile.gamertag) {
        console.log(`[${packet.xuid}] Bad Message [T5]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x95)`, 0);
    }

    if (config.textChecks.textCheck6.enabled === true && packet.xuid != profile.xuid) {
        console.log(`[${packet.xuid}] Bad Message [T6]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x96)`, 0);
    }
}

module.exports = {
	textVaildate: textVaildate
};