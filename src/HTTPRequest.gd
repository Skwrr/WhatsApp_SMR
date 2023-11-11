extends HTTPRequest


func _ready():
	pass

func _on_request_completed(_result, _response_code, _headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	$"/root/Node2D/Screen/Login/Alert".visible = true
	$"/root/Node2D/Screen/Login/Alert/Label".text = json.message
	if ("login" in json):
		if (Global.data.group.length() == 0):
			$"/root/Node2D/Screen/Login/Alert/Label".text = "You must input a valid group"
		else:
			Global.data.username = $"/root/Node2D/Screen/Login/UsernameTitle/Username".get_text();
			Global.data.password = $"/root/Node2D/Screen/Login/PasswordTitle/Password".get_text();
			if $"../../Label/CheckBox".button_pressed == true:
				Global.save();
			$"/root/Node2D/Screen/Login".visible = false
			$"/root/Node2D/Screen/Chat".visible = true
