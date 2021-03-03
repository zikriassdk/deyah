require("dotenv").config(); //Loading .env
const fs = require("fs");
const { Collection, Client } = require("discord.js");
const fetch = require('node-fetch')
const db = require("quick.db");
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const client = new Client();//Making a discord bot client
client.commands = new Collection();//Making client.commands as a Discord.js Collection
client.queue = new Map()

client.config = {
  prefix: process.env.PREFIX
};


client.snipes = new Map()
client.on('messageDelete', function(message, channel){
  
  client.snipes.set(message.channel.id, {
    content:message.content,
    author:message.author.tag,
    image:message.attachments.first() ? message.attachments.first().proxyURL : null
  })
  
})
 

          
/* Load all events */
fs.readdir(__dirname + "/events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(__dirname + `/events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
    console.log("Loading Event: " + eventName);
  });
});

//Loading Commands
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
    console.log("Loading Command: " + commandName);
  });
});
  // AFK COMMANDS
 client.on('message', async message => {
if (message.author.bot) return;
  const nik = "[AFK]";
  const afterAfk = message.member.displayName.replace(nik, "");

  if (message.author.bot || message.channel.type === "dm") return;

  let afk = new db.table("AFKs"),
    authorStatus = await afk.fetch(message.author.id),
    mentioned = message.mentions.members.first();

  let memafk;
  if (message.mentions.users.first()) {
    memafk = message.mentions.users.first();
  } else {
    memafk = message.author;
  }

  if (mentioned) {
    let status = await afk.fetch(mentioned.id);

    if (status) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`${memafk.username} is currently AFK`)
        .setThumbnail(memafk.displayAvatarURL({ format: "png", dynamic: true }))
        .addField(`Reason`, ` ${status}`)
        .setFooter("AFK since ")
        .setTimestamp();
      message.channel.send(embed).then(i => i.delete({ timeout: 5000 }));
    }
  }

  if (authorStatus) {
    message.member.setNickname(afterAfk);
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(`**${message.author.tag}** is no longer AFK.`);
    message.channel.send(embed).then(i => i.delete({ timeout: 5000 }));
    afk.delete(message.author.id);
  }
});
  // autorespod

setInterval(async () => {
  await fetch('https://berry-mu.glitch.me').then(console.log("Pinged!"))
}, 240000)
//Logging in to discord
client.login(process.env.TOKEN)
