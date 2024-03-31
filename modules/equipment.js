const config = require("../config.json");

function equipmentVaildate(packet, dbAccount, client) {
	if (config.debug) console.log(`Equipment Vaildate`);

	if (config.equipmentChecks.equipmentCheck1.enabled && packet.slot > 8 || packet.selected_slot > 8) {
		console.log(`[${dbAccount.xuid}] Bad equipment [T1]`);
		if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild equipment information sent. (0x4f1)`);
	}
}

module.exports = {
	equipmentVaildate: equipmentVaildate
};