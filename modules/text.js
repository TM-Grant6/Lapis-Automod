const config = require("../config.json");

const { isValidPlatformChatId } = require("../src/util.js");

async function textVaildate(packet, dbAccount, client, realm) {
    if (packet.type === 'translation') return;
	if (config.debug) console.log(`Text Vaildate`);

	if (config.textChecks.textCheck1.enabled && packet.message.includes('* External')) {
		console.log(`[${packet.xuid}] External Message [T1]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x91)`, 0);
	}

    if (config.textChecks.textCheck2.enabled && packet.platform_chat_id.length >= 1 && !isValidPlatformChatId(packet.platform_chat_id)) {
        console.log(`[${packet.xuid}] Bad Message [T2]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x92)`, 0);
    }

    if (config.textChecks.textCheck3.enabled && packet.platform_chat_id.length >= 1 && dbAccount.currentDevice != 'NintendoSwitch') {
        console.log(`[${packet.xuid}] Bad Message [T3]`);
		if (!config.debug) client.sendCommand(`kick "${packet.xuid}" Invaild information sent. (0x93)`, 0);
    }
}

module.exports = {
	textVaildate: textVaildate
};