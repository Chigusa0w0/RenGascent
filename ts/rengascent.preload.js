var messageOrigin = "";
var messageBuffer = null;

function createChannel() {
    messageBuffer = [];

    window.addEventListener("message", (e) => {
        if (messageBuffer === null) {
            return;
        }

        if(!e.origin.match(/(?:nga\.cn|ngacn\.cc|nga\.178\.com|nga\.donews\.com|ngabbs.com|bigccq\.cn|127\.0\.0\.1)(?::\d+)?$/)) {
            return;
        }

        const matches = String(e.data).match(/(\w+)\s+(\w+)\s+([^]+)/);
        if (!matches) return;

        let method = matches[1];
        let callback = matches[2];
        let value = matches[3];

        if (!method || method === "null") return;
        if (callback === "null") callback = null;
        if (value === "null") value = null;

        if (method) {
            messageOrigin = e.origin;
            handleMessage(method, callback, value);
        }
    });
}

function handleMessage(method, callback, value) {
    if (messageBuffer !== null) {
        messageBuffer.push({method: method, callback: callback, value: value});
    }
}

(function() {
    createChannel();
})();
