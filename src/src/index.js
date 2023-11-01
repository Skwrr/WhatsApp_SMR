'use strict';

const readline = require('readline');
const child_process = require("child_process");
const fs = require("fs");
const fetch = require("node-fetch");
const express = require("express")
const client = express();
const formidable = require("formidable")

const color = require('ansicolor');

let name;
let first = true;

const defIp = {
	"_comment": "Change the value of `channel` to change groups!",
	"channel": "clase",
	"debug": false
}

let config = defIp;

if (!fs.existsSync("./config.json")){
	fs.writeFile("./config.json", JSON.stringify(defIp), function (err) {
		if (err) throw err;
	})
} else
	config = JSON.parse(fs.readFileSync("./config.json"));
if (config == defIp)
	fs.writeFile("./config.json", JSON.stringify(defIp), function (err){
		if (err) throw err;
	});

client.post("/", (req,res) => {
	var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
		if (err){
			res.send(err);
			res.end();
			return err;
		}
		let settings = await get("http://localhost", 5640, "/config")
		if (fields.event)
			if (fields.event == "leave")
				print(color.lightMagenta((fields.alias || fields.from)+ " has left the group chat."))
			else if (fields.event == "join")
				print(color.lightMagenta((fields.alias || fields.from) + " has joined the group chat."))
		if (fields.channel)
			if(settings.channel == fields.channel)
				if (fields.from != localIp)
					print(fields.alias ? color.lightGreen(fields.alias+": "+fields.message) : color.lightGreen(fields.from+": "+fields.message));
				else
					print(fields.alias ? color.cyan(fields.alias+": "+fields.message) : color.cyan(fields.from+": "+fields.message));
		res.send({})
		res.end();
	})
})

client.get("/config", (req, res) => {
	res.send(config);
	res.end();
})

client.listen(5640);

const { networkInterfaces } = require('os');

const nets = networkInterfaces();
let localIp = "";

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
		const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
		if (net.family === familyV4Value && !net.internal && net.address.startsWith("192.168")) {
			localIp = net.address.split(".").splice(2).join(".");
		}
    }
}

async function send(body){
	try {
		return await post("http://192.168."+body.to, body, 5640)
	} catch (err){
		return {"error": true, "message": "Unavailable"}
	}
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function post(ip, body, port = 8080, path = "/"){
	const formattedUrl = ip+":"+port+path
	const response = await fetch(formattedUrl, {
		method: 'post',
		body: JSON.stringify(body),
		headers: {'Content-Type': 'application/json'},
		keepalive: true
	});
	
	try {
		return response.json()
	} catch(err){
		return {}
	}
}

async function get(ip, port = 80, path = "/"){
	const formattedUrl = ip+":"+port+path
	const response = await fetch(formattedUrl);
	
	try {
		return response.json()
	} catch(err){
		return {}
	}
}

function clearScreen() {
	child_process.execSync('cls');
	console.clear();
}

function setTitle(title) {
	child_process.execSync(`title ${title}`);
}

async function execute(cmd){
	try {
		child_process.execSync(cmd);
		return "Success"
	} catch (er) {
		return "Failed"
	}
}

function getInput(prompt, n) {
	return new Promise((resolve) => {
		setTimeout(() => 
			rl.question(prompt+(n == true ? `
` : ""), (answer) => {
				resolve(answer);
			}), 200
		);
	})
}

function print(msg){
	console.log(msg)
}

setTitle("WhatsApp SMR")

async function checkPassword(user, password, tried){
	try {
		let data = await post("http://spain.firecloudllc.info", {
			"name": user,
			"password": password
		}, 26066, "/login")
		tried++;
		if (data.access == true && data.login == true){
			print(color.lightGreen(data.message))
			name = user;
			setTimeout(() => run(), 2000);
			return;
		} else {
			if (tried == 3){
				print(color.yellow("Maximum atempts reached, using IP as username"))
				setTimeout(() => run(true), 5000);
				return;
			}
			getPassword(user, color.lightRed(data.message), tried)
		}
	} catch(err){
		if (config.debug)
			console.log(err);
		print(color.lightRed("There was an error contacting with the login server!"))
		print(color.yellow("Shutting down."))
		setTimeout(() => process.exit(1), 5000)
		return;
	}
}

function getPassword(user, message, tried){
	getInput(color.blue(message), true).then(async password => await checkPassword(user, password, tried || 0));
}

function run(bypassLogin) {
	if ((name == undefined || name.length == 0) && !bypassLogin){
		getInput(color.blue("How do you want to be identified?"), true).then(async user => {
			try {
				let data = await post("http://spain.firecloudllc.info", {
					"name": user
				}, 26066, "/login")
				if (data.access == true && data.message.includes("password"))
					getPassword(user, data.message);
				else if (data.access == true && data.useIp == true)
				{
					print(color.yellow(data.message));
					run(true)
				}
				else
					print(color.lightRed(data.message));
			} catch (err){
				if (config.debug)
					console.log(err);
				print(color.lightRed("There was an error contacting with the login server!"))
				print(color.yellow("Shutting down."))
				setTimeout(() => process.exit(1), 5000)
				return;
			}
			run();
		});
	}
	if ((name || bypassLogin) && first){
		clearScreen();
		first = !first;
		(async() => {
			let group = (await post("http://spain.firecloudllc.info", {
				"from": localIp,
				"alias": name,
				"group": config.channel
			}, 26066, "/find")).group;
			if (config.debug)
				print("Previous Group: "+group)
			if (group){
				let old_group = await post("http://spain.firecloudllc.info", {
					"from": localIp,
					"alias": name,
					"group": group
				}, 26066, "/exit")
				if (config.debug)
					print("Group: "+JSON.stringify(old_group))
				for (let member of old_group.members){
					await send({
						"from": localIp,
						"to": member.ip,
						"alias": name,
						"event": "leave"
					})
				}
			}
			
			group = await post("http://spain.firecloudllc.info", {
				"from": localIp,
				"alias": name,
				"group": config.channel
			}, 26066, "/create")
			
			if (group.messages.length > 0)
				print(color.darkGray("-------------Beggining of chat history-------------"))
			
			if(config.debug)
				print(group)
			
			for (let member of group.members){
				if (member.ip != localIp){
					await send({
						"from": localIp,
						"to": member.ip,
						"alias": name,
						"event": "join"
					})
				}
			}

			if (config.debug)
				print(JSON.stringify(group.messages))
			
			for (let message of group.messages){
				print(message.author != (name || localIp) ? color.green(color.italic(message.author+": "+message.content)) : color.cyan(color.italic(message.author+": "+message.content)))
			}
			if (group.messages.length > 0)
				print(color.darkGray("---------------Final of chat history---------------"))
			else
				print(color.darkGray("---------------No chat history found---------------"))
		})()
	}
	getInput(color.white(`> `)).then(async msg => {

		let group = await post("http://spain.firecloudllc.info", {
			"from": localIp,
			"alias": name,
			"group": config.channel,
			"message": msg
		}, 26066, "/group")
			
		if (config.debug)
			print(group);
		if (config.debug)
			print(config);

		for (let member of group.members){
			const data = {
				"from": localIp,
				"to": member.ip,
				"channel": config.channel,
				"message": msg,
				"alias": name
			}
			
			if (data.to == "0.1")
				data.to = data.from;
			
			await send(data)
		}
		
		run(name == undefined);
	})
}

process.on('SIGINT', function(){
	process.exit(1)
})

process.on("exit", async function() {
	try {
		print('Exitting');

		clearScreen();
		
		let group = await post("http://spain.firecloudllc.info", {
			"from": localIp,
			"group": config.channel
		}, 26066, "/exit")
		if (config.debug)
			print("Group: "+group)
		for (let member of group.members){
			await send({
				"from": localIp,
				"to": member.ip,
				"alias": name,
				"event": "leave"
			})
		}
	} catch(err){
		if(config.debug)
			print(err)
	}
})

clearScreen();
run();