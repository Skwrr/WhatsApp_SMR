extends Button


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	pass


func _on_pressed():
	var content = $"../LineEdit".text
	var http = $HTTPRequest
	var json = {
		"alias": Global.data.username,
		"from": Global.data.username,
		"group": Global.data.group,
		"message": content
	}
	http.request(
		"https://spain.firecloudllc.info:25865/group",
		["Content-Type: application/json"],
		HTTPClient.METHOD_POST, JSON.stringify(json)
	)
