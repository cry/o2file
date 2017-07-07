/*
 * The aim of o2file is to maintain a mirror between a file and object
 * Changes to the object should be reflected in the file, HOWEVER changes to the file need not be reflected
 */

const fs = require('fs');
const Promise = require('bluebird');

const defaults = {
     encoding: 'utf8',
     cache_timeout: 500,
     debug: false,
     touch: true
 }

let handles = {};

/*
 * Inits o2file, takes callback signature:
 *      callback(err, obj);
 */

let init = (filename, opts = {}) => {

    Object.keys(defaults).forEach((option) => typeof opts[option] === "undefined" ? opts[option] = defaults[option] : 0);

    return new Promise((resolve, reject) => {

        if (typeof handles[filename] !== "undefined") {
            reject({
                desc: `Already exists a new object backed by ${filename}`,
                errno: -1
            });

            return;
        }

        fs.readFile(filename, opts.encoding, (err, data) => {
            if (err) {
                if (err.errno != -2 || opts.touch == false) {
                    reject(err);
                    return;
                }

                fs.writeFile(filename, "{}", (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(setupProxy(filename, {}, opts));
                });

                return;
            }

            resolve(setupProxy(filename, JSON.parse(data), opts));
        });
    })
}

let setupProxy = (filename, obj, opts) => {

    let handler = {
        set: (target, prop, val, receiver) => {
            if (opts.debug) console.log(`Attempted to set ${prop}`);

            handles[filename].changed = true;
            target[prop] = val;
        }
    }

    handles[filename] = handles[filename] || {
        handle: null,
        changed: false
    };

    handles[filename].handle = setInterval(() => {
        if (!handles[filename].changed) return;

        if (opts.debug) console.log("Change detected!");

        fs.writeFile(filename, JSON.stringify(obj), (err) => {
            if (err) {
                console.error(err);
                return;
            }

            if (opts.debug) console.log("Wrote new changes!");
            handles[filename].changed = false;
        });
    }, opts.cache_timeout);

    return new Proxy(obj, handler);

}

module.exports = {
    version: 0.1,
    init: init
}
