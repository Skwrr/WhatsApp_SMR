extends Node

const FILE_NAME = "user://data.json"

var data = {
	"username": "",
	"group": "",
	"password": ""
}

func save():
	var file = FileAccess.open(FILE_NAME, FileAccess.WRITE)
	file.store_string(JSON.stringify(data))
	file.close()

func load_data():
	var file = FileAccess.open(FILE_NAME, FileAccess.READ)
	if file == null:
		return
	var d = JSON.parse_string(file.get_as_text())
	file.close()
	if typeof(d) == typeof({}):
		data = d
	else:
		printerr("Corrupted data!")
