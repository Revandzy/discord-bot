// Import modules
const Discord = require("discord.js");
const bot = new Discord.Client();
const { token, prefix, joinChannel, leaveChannel } = require("./config.json");
const fs = require("fs");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/db_01", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Guild = require("./models/Guild.js");

bot.login(token);

// Command Handler stuff
const commandsFile = fs
  .readdirSync("./commands")
  .filter((f) => f.endsWith(".js"));

bot.cmds = new Discord.Collection();
for (const file of commandsFile) {
  const command = require(`./commands/${file}`);

  bot.cmds.set(command.name, command);
}

// BOT Ready
bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  const servers = bot.guilds.cache.size;
  setInterval(() => {
    bot.user.setPresence({
      activity: {
        name: `${servers} servers | v0.1.0`,
        type: "WATCHING",
        url: "https://twitch.tv/revandzy",
      },
    });
  }, 15000);
});

// Canvas thingy
const applyText = (canvas, text) => {
  const ctx = canvas.getContext("2d");
  let fontSize = 70;

  do {
    ctx.font = `${(fontSize -= 10)}px sans-serif`;
  } while (ctx.measureText(text).width > canvas.width - 300);
  return ctx.font;
};

// Announce when member joins
bot.on("guildMemberAdd", async (member) => {
  const guild = new Guild({
    name: member.guild.name,
    gId: member.guild.id,
    ownerId: member.guild.ownerID,
    joinChnl: null,
    leaveChnl: null,
    bgImg: null,
  });

  const res = await Guild.findOne({ gId: member.guild.id });
  console.log(res);

  if (!res) {
    await guild.save().then((data) => {
      console.log(`Data saved \n${data}`);
    });
  } else {
    console.log("Data already saved");
  }

  let channel;
  const defChnl = member.guild.channels.cache
    .filter((chnl) => chnl.type == "text")
    .first();
  if (!channel) return defChnl.send("`join channel` not found.");
});

// Announce when member leaves
bot.on("guildMemberRemove", async (member) => {
  const channel = member.guild.channels.cache.find(
    (c) => c.name.toLowerCase() == leaveChannel
  );

  const defChnl = member.guild.channels.cache
    .filter((chnl) => chnl.type == "text")
    .first();

  if (!channel) return defChnl.send("`leave channel` not found.");

  const leaveMsg = [`Goodbye ${member}`];
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Background Image, bisa pake url atau dari file
  const background = await Canvas.loadImage("./Images/background.jpg");

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#74037b";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Slightly smaller text placed above the member's display name
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Goodbye", canvas.width / 2.5, canvas.height / 3.5);

  // Add an exclamation point here and below
  ctx.font = applyText(canvas, `${member.displayName}!`);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    `${member.displayName}!`,
    canvas.width / 2.5,
    canvas.height / 1.8
  );

  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(
    member.user.displayAvatarURL({ format: "jpg" })
  );

  ctx.drawImage(avatar, 25, 25, 200, 200);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "welcome-image.png"
  );

  channel.send(
    leaveMsg[Math.floor(Math.random() * leaveMsg.length)],
    attachment
  );
});

// Bot join guilds
bot.on("guildCreate", async (guild) => {
  const data = new Guild({
    name: guild.name,
    gId: guild.id,
    ownerId: guild.ownerID,
  });

  const res = await Guild.findOne({ gId: guild.id });
  console.log(res);

  if (res.length < 1) {
    return console.log(`[${res.gId}] ${res.name} is already in the database!`);
  } else {
    await data.save().then((data) => {
      console.log(data);
    });
  }
});

//COMMANDS
bot.on("message", (msg) => {
  if (
    !msg.content.startsWith(prefix) ||
    msg.author.bot ||
    msg.member.id != msg.guild.ownerID
  )
    return;
  const args = msg.content.slice(prefix.length).trim().split(" ");
  const cmd = args.shift().toLowerCase();

  if (!bot.cmds.has(cmd)) return;

  try {
    bot.cmds.get(cmd).execute(msg, args, bot, prefix);
  } catch (error) {
    console.error(error);
  }
});
