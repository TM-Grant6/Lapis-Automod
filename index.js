const fetch = require("node-fetch");
const chalk = require("chalk");
const prompt = require("prompt-sync")();
const { Authflow, Titles } = require("prismarine-auth");

const { moderate } = require("./moderate.js");
const config = require("./config.json");

const flow = new Authflow(undefined, "./authCache", {
	flow: "live",
	authTitle: Titles.MinecraftNintendoSwitch,
	deviceType: "Nintendo",
	doSisuAuth: true
});

const realm_api_headers = {
	"Accept": "*/*",
	"authorization": "",
	"charset": "utf-8",
	"client-ref": "08bdb049f310d03aeabda3748f857640eb62a733",
	"client-version": "1.20.71",
	"x-clientplatform": "Windows",
	"content-type": "application/json",
	"user-agent": "MCPE/UWP",
	"Accept-Language": "en-CA",
	"Accept-Encoding": "gzip, deflate, br",
	"Host": "pocket.realms.minecraft.net",
	"Connection": "Keep-Alive"
};

(async () => {
	try {
		const xboxToken = await flow.getXboxToken("https://pocket.realms.minecraft.net/")
			.catch((err) => {
				console.log(err);
				process.exit(0);
			});

		realm_api_headers.authorization = `XBL3.0 x=${xboxToken.userHash};${xboxToken.XSTSToken}`;

		const worlds = await fetch("https://pocket.realms.minecraft.net/worlds", {
			method: "GET",
			headers: realm_api_headers
		});

		const allRealms = (await worlds.json()).servers
			.filter(realm => !realm.expired && realm.state !== "CLOSED")
			.sort((a, b) => a.id - b.id);

		let realm = {};

		if (config.clientOptions.realmOptions.realmId < 100000 && config.clientOptions.skipRealmPicking != true) {
			console.log(chalk.blue(`${"-".repeat(35)}`));
			console.log(allRealms.map((realm, i) => `-> ${i + 1}. ${realm.name}`).join("\n"), "\n", chalk.blue("-".repeat(35))); 

			const selection = Number(prompt(chalk.blue("--> Select a number: ")));

			if (selection < 10000) {
				realm = allRealms[selection - 1];
			} else {
				realm = allRealms.find(realmData => realmData.id === selection);
			}
		} else {
			if (config.clientOptions.skipRealmPicking === true && typeof config.clientOptions.realmOptions.realmId === 'number') {
				realm = allRealms.find(realmData => realmData.id === config.clientOptions.realmOptions.realmId);
			}
		}

		if (!realm) {
			console.log(chalk.red(`---> Invalid number choice`));
			process.exit(0);
		}

		const response = await fetch(`https://pocket.realms.minecraft.net/worlds/${realm.id}/join`, {
			method: "GET",
			headers: realm_api_headers
		}).catch(() => { });

		if (!response || (response.status !== 200 && response.status !== 403 && response.status !== 503)) {
			console.log(response?.status);
			console.log(await response?.text());
			process.exit(0);
		}

		// NOTE TO W0AHL
		// MAKE THIS LOOP UNTIL SUCCESS
		// WILL FORGET STILL
		let realmIP;

		try {
			realmIP = await response.json();
		} catch (err) {
			if (response.status === 503) {
				console.log(chalk.red("---> Retry again later"));
				process.exit(1);
			}

			throw err;
		}

		if (realmIP.errorMsg) {
			console.log(realmIP.errorMsg);
			process.exit(0);
		}

		realm.ip = realmIP.address.substring(0, realmIP.address.indexOf(':'));
		realm.port = Number(realmIP.address.substring(realmIP.address.indexOf(':') + 1));

		moderate(realm);
	} catch (err) {
		if (!err.type === 'invalid-json') {
			console.log(err);
			process.exit(0);
		}
	}
})();
