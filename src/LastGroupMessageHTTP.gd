extends HTTPRequest


func _ready():
	pass

func _on_request_completed(_result, _response_code, _headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	var color = "[color='green']"
	if "message" in json:
		if json.from == Global.data.username:
			color = "[color='cyan']"
		$"..".append_text(color+json.from+": "+json.message+"[/color]\n")
