async function handleFunctions(client) {
	client.sendCommand = (command, source = 0) => {
		client.write("command_request", {
			command: command.substring(0, 512),
			origin: {
				type: source,
				uuid: "",
				request_id: ""
			},
			internal: false,
			version: 68
		});
	};
}

module.exports = {
	handleFunctions: handleFunctions
};