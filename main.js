const discord = require("discord.js");
const bot = new discord.Client();

require("dotenv").Config();
const token = process.env.BOT_TOKEN, prefix = process.env.BOT_PREFIX;

bot.on("ready", () => {
  console.log(`${bot.user.username} is online!\nPrefix: ${prefix}`);
})

bot.login(token);
