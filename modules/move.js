const config = require("../config.json");

function moveVaildate(packet, dbAccount, client) {
	if (config.debug === true) console.log(`Move Vaildate`);

	if (config.moveChecks.moveCheck1.enabled === true && packet.position.y > 323 && !dbAccount.permission === 'operator' || !dbAccount.currentGamemode === "creative") {
		console.log(`[${dbAccount.xuid}] Bad movement (Too high) [T1]`);
		if (!config.debug) client.sendCommand(`kill ${dbAccount.currentGamertag}`);
	}

	if (config.moveChecks.moveCheck2.enabled === true && packet.position.x >= 25000000 || packet.position.z > 25000000) {
		console.log(`[${dbAccount.xuid}] Bad movement (Too far) [T2]`);
		if (!config.debug) client.sendCommand(`kill ${dbAccount.currentGamertag}`);
	}
}

module.exports = {
	moveVaildate: moveVaildate
};