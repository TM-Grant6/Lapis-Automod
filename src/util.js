const { NIL, v3: uuidv3, v4: uuidv4, v5: uuidv5 } = require("uuid");
const axios = require('axios');
const cheerio = require('cheerio');

// Check for UUID version 3
function isUUIDv3(uuid) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Check for UUID version 4
function isUUIDv4(uuid) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Check for UUID version 4 without dashes
function isUUIDv4WithoutDashes(uuid) {
	return /^[0-9a-fA-F]{8}[0-9a-fA-F]{4}4[0-9a-fA-F]{3}[89abAB][0-9a-fA-F]{3}[0-9a-fA-F]{12}$/.test(uuid);
}

// Check for UUID version 5
function isUUIDv5(uuid) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function isValidPlatformChatId(platformChatId) {
	return typeof platformChatId === 'string' && /^\d{19}$/.test(platformChatId);
}

function generateRandomString(length, characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890_-") {
	const charArray = Array.from(characters);

	let result = "";

	for (let i = 0; i < length; i++) {
		result += charArray[Math.floor(Math.random() * charArray.length)];
	}

	return result;
}

function getDeviceId(deviceOS) {
	const deviceIdMap = {
		1: uuidv4().replace(/-/g, ""),
		2: uuidv4().replace(/-/g, "").toUpperCase(),
		7: uuidv3(uuidv4(), NIL),
		8: uuidv3(uuidv4(), NIL),
		11: uuidv3(uuidv4(), NIL),
		12: uuidv5(uuidv4(), NIL),
		13: `${generateRandomString(43, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890/")}=`
	};

	return deviceIdMap[deviceOS] || uuidv4();
}

async function getInputMode(deviceOS) {
	switch (deviceOS) {
		case 10:
		case 11:
		case 12:
		case 13:
			return 3;
		case 1:
		case 2:
		case 4:
		case 14:
			return 2;
		case 3:
		case 7:
		case 8:
		case 15:
			return 1;
		case 5:
		case 6:
			return 4;
		case 9:
		case 0:
			return 0;
		default:
			return null;
	}

}

async function getProtocolVersion() {
	const latestVersionEndpoint = 'https://itunes.apple.com/lookup?bundleId=com.mojang.minecraftpe&time=' + Date.now();

	const response = await axios.get(latestVersionEndpoint);
	const versionData = response.data;

	const result = versionData.results[0];
	const version = result.version;

	const websiteUrl = `https://minecraft.wiki/w/Bedrock_Edition_${version}`;
	const response2 = await axios.get(websiteUrl);
	const $ = cheerio.load(response2.data);
	const text = $('p').text();
	const protocolVersion = text.match(/\b\d{3}\b/g);

	return protocolVersion[0];
}

module.exports = {
	generateRandomString,
	getDeviceId,
	getInputMode,
	getProtocolVersion,
	isUUIDv3,
	isUUIDv4,
	isUUIDv4WithoutDashes,
	isUUIDv5,
	isValidPlatformChatId
};