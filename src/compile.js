const exe = require('@angablue/exe');
const config = require("./settings.json");
let name = config.name;
let entryFile = config.input;
let out = config.outputDir+config.name+".exe";
let icon = config.icon;

const build = exe({
    entry: entryFile,
    out: out,
    target: 'latest-win-x64',
	icon: icon, // Application icons must be in .ico format
    properties: {
        FileDescription: name,
        ProductName: name,
        LegalCopyright: 'CC BY-NC-SA 4.0 (http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1)',
        OriginalFilename: name+'.exe'
    }
});

build.then(() => {
	console.log('Build completed!')
    process.exit(0)
});