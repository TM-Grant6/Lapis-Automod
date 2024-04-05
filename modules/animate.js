const config = require("../config.json");

function animateVaildate(packet, dbAccount, client, realm) {
  if (!packet || !dbAccount || !client || !realm) return;

  if (config.debug) console.log(`Animate Vaildate`);

  if (config.animateChecks.animateCheck1.enabled && (packet.action_id !== "row_left" && packet.action_id !== "row_right") && typeof packet.boat_rowing_time === 'number') {
    console.log(`[${dbAccount.xuid}] sent a bad animate packet. [T1]`);
    if (!config.debug) {
      switch (config.animateChecks.animateCheck1.punishment) {
        case "kick":
          client.sendCommand(`kick "${dbAccount.xuid}" Invaild animate information sent. (0x2c1)`, 0);
          dbAccount.kickCount++;
          dbAccount.save();
          break;
        case "ban":
          client.sendCommand(`kick "${dbAccount.xuid}" Invaild animate information sent. (0x2c1)`, 0);
          dbAccount.banCount++;
          dbAccount.isBanned = true;
          dbAccount.save()
          break;
        case "clubKick":
          if (realm.isOwner) {
            realm.kick(dbAccount.xuid);
            dbAccount.clubKickCount++;
            dbAccount.save();
          }
          break;
        case "clubBan":
          if (realm.isOwner) {
            realm.ban(dbAccount.xuid);
            dbAccount.clubBanCount++;
            dbAccount.save();
          }
          break;
        case "warning":
          client.sendCommand(`say "${dbAccount.xuid}" You sent invaild animate information. (0x2c1)`, 0);
          dbAccount.warningCount++;
          dbAccount.save();
          break;
        default:
          break;
      }

    };
  }

  if (config.animateChecks.animateCheck2.enabled && packet.action_id === "none") {
    console.log(`[${dbAccount.xuid}] sent a bad animate packet. [T2]`);
    if (!config.debug) {
      switch (config.animateChecks.animateCheck2.punishment) {
        case "kick":
          client.sendCommand(`kick "${dbAccount.xuid}" Invaild animate information sent. (0x2c2)`, 0);
          dbAccount.kickCount++;
          dbAccount.save();
          break;
        case "ban":
          client.sendCommand(`kick "${dbAccount.xuid}" Invaild animate information sent. (0x2c2)`, 0);
          dbAccount.banCount++;
          dbAccount.isBanned = true;
          dbAccount.save()
          break;
        case "clubKick":
          if (realm.isOwner) {
            realm.kick(dbAccount.xuid);
            dbAccount.clubKickCount++;
            dbAccount.save();
          }
          break;
        case "clubBan":
          if (realm.isOwner) {
            realm.ban(dbAccount.xuid);
            dbAccount.clubBanCount++;
            dbAccount.save();
          }
          break;
        case "warning":
          client.sendCommand(`say "${dbAccount.xuid}" You sent invaild animate information. (0x2c2)`, 0);
          dbAccount.warningCount++;
          dbAccount.save();
          break;
      }
    }
  }
}

module.exports = {
  animateVaildate: animateVaildate
};