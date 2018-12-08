/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const net = require("net");

class OpenVPNManagement {

    static send(msg, callback) {
        const client = new net.Socket();

        client.setTimeout(2000);

        client.connect(1337, "127.0.0.1", () => client.write(msg + "\n"));

        client.on("timeout", function() {
            client.destroy();
            return callback(true, false);
        });

        client.on("error", function() {
            client.destroy();
            return callback(true, false);
        });

        return client.on("data", function(data) {
            client.destroy();
            // return only the line #3 with his content
            const lines = data.toString().split(/\r\n|\n|\r/);
            return callback(false, data.toString().split(/\r\n|\n|\r/)[lines.length-2]);
    });
    }

    static getLog(callback) {
        const client = new net.Socket();

        client.setTimeout(2000);

        client.connect(1337, "127.0.0.1", () => client.write('log 20\n'));

        client.on("timeout", function() {
            client.destroy();
            return callback(true, false);
        });

        client.on("error", function() {
            client.destroy();
            return callback(true, false);
        });

        return client.on("data", function(data) {
            client.destroy();
            // return only the line #3 with his content
            const lines = data.toString().split(/\r\n|\n|\r/);
            return callback(false, lines);
        });
    }
}
