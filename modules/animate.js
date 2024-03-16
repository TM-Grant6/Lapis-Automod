const config = require("../config.json");

function animateVaildate(packet, dbAccount, client) {
  if (config.debug === true) console.log(`Animate Vaildate`);

  if (config.animateChecks.animateCheck1.enabled === true && (packet.action_id !== "row_left" && packet.action_id !== "row_right") && typeof packet.boat_rowing_time === 'number') {
    console.log(`[${dbAccount.xuid}] sent a bad animate packet. [T1]`);
    if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild animate information sent. (0x2c1)`, 0);
  }

  if (config.animateChecks.animateCheck2.enabled === true && packet.action_id === "none") {
    console.log(`[${dbAccount.xuid}] sent a bad animate packet. [T2]`);
    if (!config.debug) client.sendCommand(`kick "${dbAccount.xuid}" Invaild animate information sent. (0x2c2)`, 0);
  }
}

module.exports = {
  animateVaildate: animateVaildate
};