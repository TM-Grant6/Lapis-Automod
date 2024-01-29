# Lapis Automod
Lapis Automod helps protect your Minecraft realm by moderating actions.

<p align="center">
    <img src="https://img.shields.io/github/issues/Lapis-Utilities/Lapis-Automod?label=ISSUES%20OPEN&style=for-the-badge" alt="Issues Open">  
    <img src="https://img.shields.io/github/commit-activity/m/Lapis-Utilities/Lapis-Automod?style=for-the-badge" alt="Commits Per Week"> 
    <img src="https://img.shields.io/github/last-commit/Lapis-Utilities/Lapis-Automod?style=for-the-badge" alt="Last Commit">
</p>

## Setup
- You need to set up a MongoDB database and put the database URL in the .env file.

## Detections in the Code
- The code contains various detections related to player actions, such as checking for valid skin information, device IDs, platform chat IDs, and more.

### Player List Event Handler
- The "player_list" event handler processes the incoming player records and performs the following checks:
  - Check for valid Xbox user ID and store it in a user map.
  - Validate skin information by checking skin IDs, dimensions, and such.
  - Verify the platform and platform chat ID for Nintendo Switch.

### Add Player Event Handler
- The "add_player" event handler processes the incoming player data and performs the following checks:
  - Validate the device ID and device OS against the user's account.
  - Check for too many linked device IDs and kick the player if necessary.
  - Validate the device OS specific device IDs based on the platform.
  - Verify the platform and platform chat ID for Nintendo Switch.
  - Check for unsupported or unknown device models and kick the player as necessary.

## How to Contribute
Feel free to contribute by creating a pull request.

## License
This project is licensed under the GPL-3.0 License. Please see the [LICENSE](./LICENSE) file for more details.
