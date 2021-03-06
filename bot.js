//Namespace Stuff
const fs = require('fs');
const { Client } = require('discord.js');
const client = new Client();
const Discord = require('discord.js');
const Enmap = require("enmap");
const SQLite = require("better-sqlite3");

//Config and Color jsons
const config = require('./Jsons/config.json');
const Colors = require('./Jsons/colors.json')

//Misc Namespace stuff
const message = require('./events/message');
const sql = new SQLite('./USERS.sqlite');

client.config = config;

//Command Handler
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

//when the bot is online makeing sure that there is a database called USERS.sqlite and saying that it is online in the console
client.on("ready", () => {
  const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'USERS';").get();

  if (!table['count(*)']) {
    sql.prepare("CREATE TABLE USERS(id TEXT PRIMARY KEY, user TEXT, BANS INT, Warns INT, warn_reason TEXT, commands INT);").run();
  }

  client.getUser = sql.prepare("SELECT * FROM USERS WHERE user = ?");
  client.setUser = sql.prepare("INSERT OR REPLACE INTO USERS (id, user, BANS, Warns, warn_reason, commands) VALUES (@id, @user, @BANS, @Warns, @warn_reason, @commands);");


  client.guilds.cache.forEach(guild => {
    if (guild.channels.cache.find(r => r.name === 'Server Stats')) {
      var array = guild.channels.cache.find(r => r.name === 'Server Stats').children.keyArray()

      client.channels.cache.get(array[0]).setName(`Total Users : ${guild.memberCount}`);
      client.channels.cache.get(array[1]).setName(`Users : ${guild.members.cache.filter(m => !m.user.bot).size}`);
      client.channels.cache.get(array[2]).setName(`Bots : ${guild.members.cache.filter(m => m.user.bot).size}`);
    }
  })

  console.log(`logged in as ${client.user.tag}`)

})


client.on('guildCreate', guild => {
  fs.readdir('./Jsons/Server_Config', (err, files) => {



    if (!files.includes(`${guild.name} Server Config`)) {

      let configsettings = {
        Modules: [{ name: "Message on new Member", value: false }, { name: "Welcome Page", value: false }, { name: "Admin Tools", value: true }, { name: "Admin Role", value: "" }, { name: "Member Role", value: "" }, { name: "Welcome Page Channel", value: "" }]
      }

      let name = `${guild.name} Server Config`
      let data = JSON.stringify(configsettings);
      var path = './Jsons/Server_Config/';
      fs.writeFileSync(path + name, data);
    }

    guild.owner.send("please do !setconfig in the server to set the server **Admin Role**")

  });
})

//when a new user joins the server 
client.on("guildMemberAdd", member => {

  let path = `./Jsons/Server_Config/${member.guild.name} Server Config`
  var Array = [];
  var Objects = [];
  var array = member.guild.channels.cache.find(r => r.name === 'Server Stats').children.keyArray()


  fs.readFile(path, (err, data) => {
    if (err) throw err;
    Array = JSON.parse(data);

    for (i in Array.Modules) {
      Objects.push(Array.Modules[i].name)
    }

    let ServerConfig = Array.Modules.find(r => r.name === "Message on new Member").value

    if (ServerConfig == true) {
      member.guild.channels.cache.find(r => r.name === 'join-and-leave').send(new Discord.MessageEmbed()
        .setTitle("A New Users")
        .setDescription(`${member.user.tag} has join the ${member.guild.name} Server`)
        .setThumbnail(member.user.displayAvatarURL())
        .addField(`Members now:`, `${member.guild.memberCount}`)
        .setTimestamp()
        .setFooter(`Created by ${client.user.tag}`)
        .setColor(Colors.Green)
        .setAuthor(`${client.user.tag}`, client.user.displayAvatarURL())
      );
    }

  })

  let score

  if (member.guild) {
    score = client.getUser.get(member.displayName);
    if (!score) {
      score = { id: member.displayName, user: member.displayName, BANS: 0, Warns: 0, warn_reason: "", commands: 0 }
    }

    client.setUser.run(score);

  }

  if (member.guild.channels.cache.find(r => r.name === 'Server Stats')) {
    client.channels.cache.get(array[0]).setName(`Total Users : ${member.guild.memberCount}`);
    client.channels.cache.get(array[1]).setName(`Users : ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
    client.channels.cache.get(array[2]).setName(`Bots : ${member.guild.members.cache.filter(m => m.user.bot).size}`);
  }
})


client.on('error', error => {
  
})


//When a user leaves the server
client.on('guildMemberRemove', member => {
  if (member.guild.channels.cache.find(r => r.name === 'Server Stats')) {
    var array = member.guild.channels.cache.find(r => r.name === 'Server Stats').children.keyArray()

    client.channels.cache.get(array[0]).setName(`Total Users : ${member.guild.memberCount}`);
    client.channels.cache.get(array[1]).setName(`Users : ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
    client.channels.cache.get(array[2]).setName(`Bots : ${member.guild.members.cache.filter(m => m.user.bot).size}`);
  }
})


//log in for the bot
client.login(config.token);