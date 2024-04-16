import { world } from "@minecraft/server";

function getScore(player, objective) {
    try {
        return world.scoreboard.getObjective(objective).getScore(player) ? world.scoreboard.getObjective(objective).getScore(player) : 0;
    } catch {
        if (!world.scoreboard.getObjective(objective)) {
            world.scoreboard.addObjective(objective);
        }
        return 0
    }
}

function metricNumbers(value) {
    const types = ["", "K", "M", "B", "T", "Q", "QD", "SX", "SP", "O", "N", "D"];
    const selectType = (Math.log10(value) / 3) | 0;
    if (selectType == 0) return value;
    let scaled = value / Math.pow(10, selectType * 3);
    return scaled.toFixed(2) + types[selectType];
}

function getRanks(player) {
    let rank_prefix = "rank:";
    let default_rank = "§aMember§r";
    const ranks = player
        .getTags()
        .map((tags) => {
            if (!tags.startsWith(rank_prefix)) return null;
            return tags
                .substring(rank_prefix.length)
                .replace("§k", "")
        })
        .filter((tag) => tag);
    return ranks.length == 0 ? [default_rank] : ranks;
}

world.beforeEvents.chatSend.subscribe((data) => {
    data.cancel = true;
    world.sendMessage(`§7[§r${getRanks(data.player).join("§7, ")}§r§7] §r§e${data.player.name}: §f${message}`);
    player.runCommandAsync(`tellraw @a[tag=bot] {"rawtext":[{"text":"${data.player.name} |_-/\-_-/\-_| ${message}"}]}`);
});