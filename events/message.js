module.exports = (client, message) => {
  //Namespace Stuff
  const SQLite = require("better-sqlite3");
  const sql = new SQLite('./USERS.sqlite');

  const fs = require('fs');
  const Path = './Jsons/Server_Config/'
 
  var Array = [];

  //ingore all of the bot messsages
  if(message.author.bot) return;

  //geting the users Database Info
  let MessageAuthor
  MessageAuthor = client.getUser.get(message.author.username);

  //If they dont exist lets make them exist
  if(!MessageAuthor){
      MessageAuthor = { id: message.author.username, user: message.author.username, BANS: 0, Warns : 0, warn_reason: "", commands: 0}
  }

  //+ 1 there commands feilds everytime they send ! in the server
  if(message.content.startsWith('!')){
    MessageAuthor.commands++;
  }

  //setting the commands into the database
  client.setUser.run(MessageAuthor)

  //just making sure that if someone types in the welcome channel that is not !agree that i gets deleted
  if(message.channel.name === "welcome"){
    agree();
  }


  //Delete fucntion this only deltes unpinned messages
  async function agree(){
    const allMessages = await message.channel.messages.fetch()
    const deletable = allMessages.filter(message => !message.pinned)
    await message.channel.bulkDelete(deletable, true)
  }

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  // Spillting user message from ! and Message eg !, ping and just getting the word 
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if(message.channel.type === 'dm' && message.content.startsWith("!")){return message.author.send("sorry i do no take commands in DMs only servers")};

  fs.readdir(Path, (err, files) => {
    if(!files.includes(`${message.guild.name} Server Config`) && command === "setconfig"){
      const cmd = client.commands.get(command);
    
      // If that command doesn't exist, silently exit and do nothing
      if (!cmd) return;

      // Run the command
      cmd.run(client, message, args);
    }
    if(!files.includes(`${message.guild.name} Server Config`)){
      return message.channel.send('Sorry there was no Config file for this serever please do !setconfig to set your servers Settings');
    }
    else{
      fs.readFile(`./Jsons/Server_Config/${message.guild.name} Server Config`, function(err, data){
        if (err) throw err;
        Array = JSON.parse(data);
    
        if(Array.Modules.find(r => r.name === "Admin Role").value === ""){
          message.channel.send("There has been no **Admin Role** set please do so")
        }


        if (['ban', 'warn', 'kick', 'purge'].includes(command) && Array.Modules.find(r => r.name === "Admin Tools").value == false){
          return message.author.send('sorry but **Admin Tools** are turned off');
        }
    
        // Grab the command data from the client.commands Enmap
        const cmd = client.commands.get(command);
  
  
        // If that command doesn't exist, silently exit and do nothing
        if (!cmd) return;
  
        // Run the command
        cmd.run(client, message, args);
    
      });
    }
  })
};