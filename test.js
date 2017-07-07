const o2file = require('./index.js');

let opts = {
    debug: true
}

o2file.init("myobj.json", opts).then((obj) => {
    obj.lol = "lol";
    obj.memes = "new memes"

    o2file.destroy("myobj.json");
});
