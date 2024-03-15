const config = require("../config.json");

const { getXboxUserData, getTitleHistory, getClubData } = require("../xbox.js");

async function apiVaildate(packet, dbAccount, client, realm) {
    if (config.debug === true) console.log(`API Vaildate`);

    const profile = await getXboxUserData(packet.xbox_user_id);
    const titles = await getTitleHistory(packet.xbox_user_id);

    if (config.apiChecks.apiCheck1.enabled === true) {
        let isAlt;

        const totalPercent = (
            (profile.detail.followerCount < config.apiChecks.apiCheck1.followerValue ? 10 : 0) +
            (profile.detail.followingCount < config.apiChecks.apiCheck1.followingValue ? 10 : 0) +
            (profile.detail.bio.length === 0 ? 10 : 0) +
            (profile.detail.accountTier === 'Silver' ? 10 : 0) +
            (profile.presenceText.includes('Minecraft') ? 10 : 0) +
            (profile.presenceState === 'Online' ? 0 : 10) +
            ((profile.gamerScore < config.apiChecks.apiCheck1.gamerScoreValue) ? 10 : 0) +
            (profile.preferredColor.primaryColor === '107c10' && profile.preferredColor.secondaryColor === '102b14' && profile.preferredColor.tertiaryColor === '155715' && profile.colorTheme === 'gamerpicblur' ? 5 : 0) +
            (titles[0].length === 0 ? 10 : 0) +
            (titles[0].length === 1 ? 8 : titles.length === 2 ? 6 : titles.length === 3 ? 4 : titles.length === 4 ? 2 : 0) +
            (profile.presenceDetails[0].length === 0 ? 10 : 0)
        );

        // totalPercent max is 95, but if its over 100 anyways, do just 100 alone
        // and if I add more later anyways it'll be useful either way.
        if (totalPercent > 100) totalPercent = 100;

        if (totalPercent >= config.apiChecks.apiCheck1.overallValue) {
            isAlt = true;
        } else {
            isAlt = false;
        }

        if (isAlt === true) {
            console.log(`[${packet.xbox_user_id}] API detection [T1] - ${totalPercent}%`);
            if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Failed to meet requirements. (${totalPercent}%%) (0xFFF1)`);
        }
    }

    if (config.apiChecks.apiCheck2.enabled === true) {
        setTimeout(async () => {
            const presence = await getClubData(realm.clubId);

            if (Array.isArray(presence.clubPresence)) {
                for (const plr of presence.clubPresence) {
                    if (packet.xbox_user_id.includes(plr.xuid) && plr.lastSeenState !== "InGame") {
                        console.log(`[${packet.xbox_user_id}] API detection [T2]`);
                        if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Not presence in the realm. (0xFFF2)`);
                        return;
                    }
                }
            }
        }, config.apiChecks.apiCheck2.cooldown * 1000); // Cooldown for people with slower devices or network.
    }
}

module.exports = {
    apiVaildate: apiVaildate
};