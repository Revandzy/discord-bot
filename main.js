const discord = require("discord.js");
const bot = new discord.Client();

require("dotenv").Config();
const prefix = process.env.BOT_PREFIX;

bot.on("ready", () => {
  console.log(`${bot.user.username} is online!\nPrefix: ${prefix}`);
})

bot.on("message", (msg) => {
  if (msg.content.startsWith('r.ping')) {
    msg.channel.send("Pong!");
  }
})

bot.login(process.env.BOT_TOKEN);
