const config = require("../config.json");

const { getXboxUserData, getTitleHistory, getClubData } = require("../xbox.js");
const { getAccountInfo, getUserPlayFabId, getPlayerProfile, getPlayerCombinedInfo } = require("../playfab.js")

async function apiVaildate(packet, dbAccount, client, realm) {
    if (config.debug === true) console.log(`API Vaildate`);

    const profile = await getXboxUserData(packet.xbox_user_id);
    const titles = await getTitleHistory(packet.xbox_user_id);

    // We do not check their PlayFabId by Player List because it can be spoofed.
    const playFabId = await getUserPlayFabId(packet.xbox_user_id);
    const accountInfo = await getAccountInfo(playFabId.Data[0].PlayFabId);
    const playerProfile = await getPlayerProfile(playFabId.Data[0].PlayFabId);

    if (config.apiChecks.apiCheck1.enabled === true) {
        let isAlt;

        const date = Date.parse(accountInfo.AccountInfo.Created);
        const now = Date.now();

        const diffTime = Math.abs(now - date);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        diffDays -= 1 // A day inaccurate

        const totalPercent = (
            (profile.detail.followerCount < config.apiChecks.apiCheck1.followerValue ? 10 : 0) +
            (profile.detail.followingCount < config.apiChecks.apiCheck1.followingValue ? 10 : 0) +
            (profile.detail.bio.length === 0 ? 10 : 0) +
            (profile.detail.accountTier === 'Silver' ? 10 : 0) +
            (profile.presenceText.includes('Minecraft') ? 0 : 10) +
            (profile.presenceState === 'Online' ? 0 : 10) +
            ((profile.gamerScore < config.apiChecks.apiCheck1.gamerScoreValue) ? 10 : 0) +
            (profile.preferredColor.primaryColor === '107c10' && profile.preferredColor.secondaryColor === '102b14' && profile.preferredColor.tertiaryColor === '155715' && profile.colorTheme === 'gamerpicblur' ? 5 : 0) +
            (titles[0].length === 0 ? 10 : 0) +
            (titles[0].length === 1 ? 8 : titles.length === 2 ? 6 : titles.length === 3 ? 4 : titles.length === 4 ? 2 : 0) +
            (profile.presenceDetails[0].length === 0 ? 10 : 0) +
            (diffDays < config.apiChecks.apiCheck1.createdValue ? 20 : 0)
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
            console.log(`[${packet.xbox_user_id}] API detection [T1] - ${totalPercent}% - Created: ${accountInfo.AccountInfo.Created}`);
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

    if (config.apiChecks.apiCheck3.enabled === true && playerProfile.PlayerProfile?.DisplayName) {
        console.log(`[${packet.xbox_user_id}] API detection [T3]`);
        if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" You're not allowed to have Display Names in the PlayFab API. (0xFFF3)`);
    }

    if (config.apiChecks.apiCheck4.enabled === true && packet.skin_data.play_fab_id !== playerProfile.PlayerProfile.PlayerId.toLowerCase()) {
        console.log(`[${packet.xbox_user_id}] API detection [T4]`);
        if (!config.debug) client.sendCommand(`kick "${packet.xbox_user_id}" Invaild ID. (0xFFF4)`);
    }
}

module.exports = {
    apiVaildate: apiVaildate
};