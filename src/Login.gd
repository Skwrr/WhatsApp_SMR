extends Panel


# Called when the node enters the scene tree for the first time.
func _ready():
	Global.load_data()
	if Global.data.username.length() != 0:
		$"UsernameTitle/Username".text = Global.data.username;
	if Global.data.password.length() != 0:
		$"PasswordTitle/Password".text = Global.data.password;
	if Global.data.group.length() != 0:
		$"GroupTitle/Group".text = Global.data.group;


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	pass
