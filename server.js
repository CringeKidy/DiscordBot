const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

const config = require("./config.json")
const Discord = require('discord.js')
const client = new Discord.Client

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});




//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');
client.login(config.token)