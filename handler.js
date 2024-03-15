const { getRealmToken } = require("./xbox.js");

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

async function handleFunctions(client) {
	client.sendCommand = (command, source = 0) => {
		client.queue("command_request", {
			command: command.substring(0, 512),
			origin: {
				type: source,
				uuid: "",
				request_id: ""
			},
			internal: false,
			version: 72
		});
	};
}

async function handleRejoin(realm) {
	const { moderate } = require("./moderate.js");

	const authToken = await getRealmToken();

	if (!authToken) {
		console.log(chalk.red("Failed to get auth token"));
		process.exit(1);
	}

	realm_api_headers.authorization = `XBL3.0 x=${authToken.userHash};${authToken.XSTSToken}`;

	const response = await fetch(`https://pocket.realms.minecraft.net/worlds/${realm.id}/join`, {
		method: "GET",
		headers: realm_api_headers
	}).catch(() => { });

	if (!response || (response.status !== 200 && response.status !== 403 && response.status !== 503)) {
		console.log(response?.status);
		console.log(await response?.text());
		process.exit(0);
	}

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
}

module.exports = {
	handleFunctions,
	handleRejoin
};