extends RichTextLabel
var t = 18
var d = false


# Called when the node enters the scene tree for the first time.
func _ready():
	pass

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if (t > 0):
		t = t-1
	else:
		if (d == false):
			var json = {
				"from": Global.data.username,
				"alias": Global.data.username,
				"group": Global.data.group
			}
			if (Global.data.group.length() == 0):
				return
			$GroupHistoryHTTP.request(
				"https://spain.firecloudllc.info:25865/group",
				["Content-Type: application/json"],
				HTTPClient.METHOD_POST, JSON.stringify(json)
				)
			d = true
		t = 18
		var json = {
			"from": Global.data.username,
			"alias": Global.data.username,
			"group": Global.data.group
		}
		if (Global.data.group.length() == 0):
			return
		$LastGroupMessageHTTP.request(
			"https://spain.firecloudllc.info:25865/read",
			["Content-Type: application/json"],
			HTTPClient.METHOD_POST, JSON.stringify(json)
			)
		t = t+5
