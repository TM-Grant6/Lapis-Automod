const fetch = require("node-fetch");
const { getPlayFabToken } = require("./xbox.js");

const apiUrl = "https://a667.playfabapi.com";
const sdkVersion = "XPlatCppSdk-3.6.190304";

const api_headers = {
	"Accept": "application/json",
	"content-type": "application/json; charset=utf-8",
	"User-Agent": "libhttpclient/1.0.0.0",
	"x-playfabsdk": sdkVersion,
	"x-reporterrorassuccess": true,
	"Accept-Language": "en-US",
	"Accept-Encoding": "gzip, deflate, br",
	"Host": "a667.playfabapi.com",
	"Connection": "Keep-Alive",
	"Cache-Control": "no-cache"
};

async function loginWithXboxA667() {
	const authToken = await getPlayFabToken();
	if (authToken.errorMsg) return authToken;

	const body = JSON.stringify({
		CreateAccount: true,
		TitleId: "A667",
		XboxToken: `XBL3.0 x=${authToken.userHash};${authToken.XSTSToken}`
	}, null, 2);

	const response = await fetch(`${apiUrl}/Client/LoginWithXbox`, {
		method: "POST",
		headers: {
			...api_headers,

			"Content-Length": body.length
		},
		body: body
	});

	const data = await response.json();

	if (data.status !== "OK") return { errorMsg: `[loginWithXbox] ${data.code} ${data.status}. Error: ${data.errorMessage}` };

	return data.data;
}

async function getAccountInfoA667(playFabId) {
	if (!playFabId) return;

	const authData = await loginWithXboxA667();
	if (authData.errorMsg) return authData;

	const body = JSON.stringify({
		PlayFabId: playFabId
	}, null, 2);

	const response = await fetch(`${apiUrl}/Client/GetAccountInfo`, {
		method: "POST",
		headers: {
			...api_headers,

			"x-entitytoken": authData.EntityToken.EntityToken,
			"Content-Length": body.length
		},
		body: body
	});

	const data = await response.json();
	if (data.status !== "OK") return { errorMsg: `${data.code} ${data.status}. Error: ${data.errorMessage}` };

	return data.data;
}

async function getPlayerProfileA667(playFabId) {
	if (!playFabId) return;

	const authData = await loginWithXboxA667();
	if (authData.errorMsg) return authData;

	const body = JSON.stringify({
		PlayFabId: playFabId
	}, null, 2);

	const response = await fetch(`${apiUrl}/Client/GetPlayerProfile`, {
		method: "POST",
		headers: {
			...api_headers,

			"x-entitytoken": authData.EntityToken.EntityToken,
			"Content-Length": body.length
		},
		body: body
	});

	const data = await response.json();
	if (data.status !== "OK") return { errorMsg: `${data.code} ${data.status}. Error: ${data.errorMessage}` };

	return data.data;
}

async function getPlayerCombinedInfoA667(playFabId) {
	if (!playFabId) return;

	const authData = await loginWithXboxA667();
	if (authData.errorMsg) return authData;

	const body = JSON.stringify({
        InfoRequestParameters: {
			GetCharacterInventories: true,
			GetCharacterList: true,
			GetPlayerProfile: true,
			GetPlayerStatistics: true,
			GetTitleData: true,
			GetUserAccountInfo: true,
			GetUserData: true,
			GetUserInventory: true,
			GetUserReadOnlyData: true,
			GetUserVirtualCurrency: true,
			PlayerStatisticNames: null,
			ProfileConstraints: null,
			TitleDataKeys: null,
			UserDataKey: null,
			UserReadOnlyDataKeys: null
		},
		PlayFabId: playFabId
	}, null, 2);

	const response = await fetch(`${apiUrl}/Client/GetPlayerCombinedInfo`, {
		method: "POST",
		headers: {
			...api_headers,

			"x-entitytoken": authData.EntityToken.EntityToken,
			"Content-Length": body.length
		},
		body: body
	});

	const data = await response.json();
	if (data.status !== "OK") return { errorMsg: `${data.code} ${data.status}. Error: ${data.errorMessage}` };

	return data.data;
}

async function getUserPlayFabIdA667(xuid) {
	if (!xuid) return;
	
	const authData = await loginWithXboxA667();
	if (authData.errorMsg) return authData;

	const body = JSON.stringify({
		XboxLiveAccountIds: [xuid],
        SANDBOX: "RETAIL"
	}, null);

	const response = await fetch(`${apiUrl}/Client/GetPlayFabIDsFromXboxLiveIDs`, {
		method: "POST",
		headers: {
			...api_headers,

			"x-entitytoken": authData.EntityToken.EntityToken,
			"Content-Length": body.length
		},
		body: body
	});

	const data = await response.json();

	if (data.status !== "OK") return { errorMsg: `${data.code} ${data.status}. Error: ${data.errorMessage}` };

	return data.data;
}

module.exports = {
    getAccountInfoA667,
    getUserPlayFabIdA667,
    getPlayerProfileA667,
    getPlayerCombinedInfoA667
}