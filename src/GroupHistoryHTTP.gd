extends HTTPRequest
var once = false

func _ready():
	pass

func _on_request_completed(_result, _response_code, _headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if once == true:
		return
	if "messages" in json:
		once = false
		$"..".append_text("------------Start of chat history------------\n")
		for m in json.messages.history:
			var color = "[color='green']"
			if m.author == Global.data.username:
				color = "[color='cyan']"
			$"..".append_text(color+m.author+": "+m.content+"[/color]\n")
		$"..".append_text("------------End of chat history------------\n")
