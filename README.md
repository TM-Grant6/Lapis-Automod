# Lapis Automod
Lapis Automod helps protect your Minecraft realm by moderating actions.

<p align="center">
    <img src="https://img.shields.io/github/issues/Lapis-Utilities/Lapis-Automod?label=ISSUES%20OPEN&style=for-the-badge" alt="Issues Open">  
    <img src="https://img.shields.io/github/commit-activity/m/Lapis-Utilities/Lapis-Automod?style=for-the-badge" alt="Commits Per Week"> 
    <img src="https://img.shields.io/github/last-commit/Lapis-Utilities/Lapis-Automod?style=for-the-badge" alt="Last Commit">
    <a href="https://discord.gg/HMHvvUKe8j">
      <img src="https://img.shields.io/discord/1118869295770914949?style=for-the-badge&logo=discord&label=discord&color=5865F2">
    </a>
</p>

## Setup
- You need to set up a MongoDB database and put the database URL in the .env file.
- You can also modify the [config](./config.json) to your liking.

## Detections in the Code
- The code contains various detections related to player actions, such as checking for valid skin information, device IDs, platform chat IDs, and more.

### Player List Event Handler
- The "player_list" event handler processes the incoming player records and performs the following checks:
  - Check for valid Xbox user ID and store it in a user map.
  - Validate skin information by checking skin IDs, dimensions, and such.
  - Verify the platform and platform chat ID for Nintendo Switch.
  - Device OS checks to confirm a vaild Device OS.
  - Ban devices the user configures.

### Add Player Event Handler
- The "add_player" event handler processes the incoming player data and performs the following checks:
  - Validate the device ID and device OS against the user's account.
  - Check for too many linked device IDs and kick the player if necessary.
  - Validate the device OS specific device IDs based on the platform.
  - Verify the platform and platform chat ID for Nintendo Switch.
  - Check for unsupported or unknown device models and kick the player as necessary.
  - Device OS checks to confirm a vaild Device OS.
  - Ban devices the user configures.

### Emote Event Handler
- The "emote" event handler processes the incoming emote data and performs the following checks:
  - Verify the emote flags and kick the player if necessary.
  - Validate the emote ID.

### Animate Event Handler
- The "animate" event handler processes the incoming animation data and performs the following checks:
  - Check if a user has the "boat_rowing_time" when it is not the row_left or row_right.
  - Check for unknown or none animations.

### Equipment Handler
- The "mob_equipment" event handler processes the incoming data and performs the following checks:
  - Checks for invaild slots above 8.

### API Handler
- The API Handler processes the incoming API data from Xbox and or other links to perform the following checks:
  - Checks if it is a alt, it determines if it is or not, this is up to **YOUR** config. It's not a great idea to have follower/following checks, but the option is there and 0 by default.
  - Checks if they have a display name in their PlayFab Request.
  - Checks if their PlayFabID to vaild or not between the server and API.

## How to Contribute
Feel free to contribute by creating a pull request anytime.

## License
This project is licensed under the AGPL-3.0 License. Please see the [LICENSE](./LICENSE) file for more details.
