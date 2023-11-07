'use strict';

const readline = require('readline');
const child_process = require("child_process");
const fs = require("fs");
const fetch = require("node-fetch");
const express = require("express")
const client = express();
const formidable = require("formidable")
let ready = false;

const color = require('ansicolor');

/*var textIndex = "> ";
var current = "";
var stdin = process.stdin;
var stdout = process.stdout;
async function getInput(str, newline){
    return new Promise((resolve) => {
		setTimeout(() => {
			stdin.setEncoding('utf8');
			stdout.write(str+(newline ? "\b" : ""));
			stdout.write(textIndex);
			stdin.on('data', function(key){
				switch (key){
					case '\u001B\u005B\u0041':
					case '\u001B\u005B\u0043':
					case '\u001B\u005B\u0042':
					case '\u001B\u005B\u0044':
					break;
					case '\u0003':
						process.exit();
					break;
					case '\u000d':
						current = ""; 
						console.log("\b");
						stdin.destroy()
						resolve(current);
					return textIndex;
					case '\u007f':
						stdout.write("\r\x1b[K") ;
						current = current.slice(0, -1);
						stdout.write(textIndex + current);
					break;
					default:
						stdout.write(key);
						current += key;
					break;
				}
			});
		}, 200)
	});
}*/
function print(str){
    /*let totalCurrentLength = current.length + textIndex.length;
    let lines = Math.ceil(totalCurrentLength / stdout.columns);
    
    for(i = 0; i < lines; i++){
        stdout.clearLine();
        stdout.write('\u001B\u005B\u0041');
    }
    
    stdout.write('\u001B\u005B\u0042');
    
    stdout.cursorTo(0)*/
    console.log(str);
    //stdout.write(textIndex + current);
}

async function getLatestUnreadMessage(){
	return await post("http://spain.firecloudllc.info", {
		"from": localIp,
		"alias": name,
		"group": config.channel
	}, 26066, "/read")
}

let name;
let first = true;

const defIp = {
	"_comment": "Change the value of `channel` to change groups!",
	"channel": "welcome",
	"debug": false
}

/*async function isAdmin(){
	try {
		child_process.execFileSync( "net", ["session"], { "stdio": "ignore" } );
		return true;
	}
	catch ( e ) {
		return false;
	}
}*/

/*async function useFirewall(){
	execute(await isAdmin() ? "netsh advfirewall firewall add rule name=\"WhatsApp SMR\" dir=in action=allow protocol=TCP localport=5640" : "msg * Is recomended to run WhatsApp SMR as Administrator if you experience any issue")
}*/

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

/*client.post("/", (req,res) => {
	var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
		if (err){
			res.send(err);
			res.end();
			return err;
		}
		let settings = await get("http://localhost", 5640, "/config")
		if (settings.debug)
			print("Request: "+JSON.stringify(fields))
		if (fields.event)
			if (fields.event == "leave"){
				if (config.debug){
					print(fields.old_alias)
					print(fields.old_from)
					print("Process Leave")
				}
				print(color.lightMagenta((fields.old_alias || fields.old_from)+ " has left the group chat."))
			}else if (fields.event == "join"){
				print(color.lightMagenta((fields.alias || fields.from) + " has joined the group chat."))
				if (config.debug){
					print(fields.alias)
					print(fields.from)
					print("Process Join")
				}
			}
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

client.listen(5640);*/

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

async function loop(){
	setInterval(async()=>{
		if (ready){
			let lastMessage = await getLatestUnreadMessage();
			if (lastMessage.message)
				print(lastMessage.from == (name || localIp) ? color.cyan(lastMessage.from+": "+lastMessage.message) : color.green(lastMessage.from+": "+lastMessage.message))
		}
	}, 500)
}

async function send(body, route){
	try {
		return await post("http://spain.firecloudllc.info", body, 26066, route || "/group")
		//return await post("http://192.168."+body.to, body, 5640)
	} catch (err){
		if (config.debug)
			print(err);
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
		if (config.debug)
			print(err);
		return {}
	}
}

async function get(ip, port = 80, path = "/"){
	const formattedUrl = ip+":"+port+path
	const response = await fetch(formattedUrl);
	
	try {
		return response.json()
	} catch(err){
		if (config.debug)
			print(err);
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
			}), 500
		);
	})
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
			setTimeout(async() => {await run()}, 2000);
			return;
		} else {
			if (tried == 3){
				print(color.yellow("Maximum atempts reached, using IP as username"))
				setTimeout(async() => {await run(true)}, 5000);
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

async function run(bypassLogin) {
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
					await run(true)
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
			await run();
		});
	}
	if ((name || bypassLogin) && first){
		clearScreen();
		ready = true;
		//await useFirewall();
		first = !first;
		/*let old = await post("http://spain.firecloudllc.info", {
			"from": localIp,
			"alias": name,
			"group": config.channel
		}, 26066, "/find");
		let group = old.group;
		let old_member = old.member;
		if (config.debug)
			print("Previous Group: "+group)
		if (config.debug)
		print("Previous member: "+JSON.stringify(old_member))
		if (group){
			let old_group = await post("http://spain.firecloudllc.info", {
				"from": localIp,
				"alias": old_member.alias,
				"group": group
			}, 26066, "/exit")
			if (config.debug)
				print("Group: "+JSON.stringify(old_group))
			for (let member of old_group.members){
				let dataJson = {
					"from": localIp,
					"to": member.ip,
					"alias": name,
					"old_from": old_member.ip,
					"old_alias": old_member.alias,
					"event": "leave"
				}
				if (config.debug)
					dataJson.debug = true;
				if (config.debug)
					print(JSON.stringify(dataJson))
				await send(dataJson)
				if (config.debug)
					print("Sent Leave On Join")
			}
		}*/
		
		let group = await post("http://spain.firecloudllc.info", {
			"from": localIp,
			"alias": name,
			"group": config.channel
		}, 26066, "/group")
		
		if (!group){
			print("No group found!")
			process.exit(0);
		}
		
		if (group.messages.history.length > 0)
			print(color.darkGray("-------------Beggining of chat history-------------"))
		if (config.debug)
			print(JSON.stringify(group.messages.history))
		
		for (let message of group.messages.history)
			print(message.author != (name || localIp) ? color.green(color.italic(message.author+": "+message.content)) : color.cyan(color.italic(message.author+": "+message.content)))
		if (group.messages.history.length > 0)
			print(color.darkGray("---------------Final of chat history---------------"))
		else
			print(color.darkGray("---------------No chat history found---------------"))
	}
	getInput(color.white(`> `)).then(async msg => {

		let data = {
			"from": localIp,
			"alias": name,
			"group": config.channel,
			"message": msg
		}
		
		if (config.debug)
			print("Data: "+data)

		let group = await post("http://spain.firecloudllc.info", data, 26066, "/group")
			
		if (config.debug)
			print(group);
		if (config.debug)
			print(config);
		
		await run(name == undefined);
	})
}

process.on('unhandledRejection', function(err){
	fs.writeFileSync("crash.txt", err.message);
})

clearScreen();
(async() => {
	await run()
	await loop();
})();