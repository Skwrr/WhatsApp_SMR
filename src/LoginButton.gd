extends Button


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	pass

func hashPassword(pwd: String) -> String:
	return "" if pwd.length() == 0 else pwd.sha256_text()

func _on_pressed():
	$"/root/Node2D/Screen/Login/Alert".visible = false
	var json = {
		"name": $"/root/Node2D/Screen/Login/UsernameTitle/Username".get_text(),
		"password": hashPassword($"/root/Node2D/Screen/Login/PasswordTitle/Password".get_text())
	}
	Global.data.group = $"/root/Node2D/Screen/Login/GroupTitle/Group".get_text()
	
	$"/root/Node2D/Screen/Login/LoginButton/HTTPRequest".request("https://spain.firecloudllc.info:25865/login", ["Content-Type: application/json"], HTTPClient.METHOD_POST, JSON.stringify(json))
