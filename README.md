# o2file

File backed JavaScript objects (or changes you make to objects will be reflected in a file of your choosing).

Useful for log objects where you need to automatically persist changes you make to objects.

## Install & Usage

```shell
    npm install o2file --save
```

```javascript
    const o2file = require("o2file");

    o2file.init("myfile", opts).then((obj) => {
        // use obj here
    });
```
