/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Debug {

    static error(errorName, errorMsg, errorLog) {
        errorLog = errorLog || false;
        const d = new Date();
        const dateStr = `[${d.getMinutes()}:${d.getMilliseconds()}]`;
        if (errorLog) {
            console.log(dateStr + " [ERROR] " + errorMsg, errorLog);
        } else {
            console.log(dateStr + " [ERROR] > " + errorMsg);
        }

        return Bugsnag.notify(errorName, errorMsg, errorLog, "error");
    }

    static warning(warningMsg, warningLog) {
        warningLog = warningLog || false;
        const d = new Date();
        const dateStr = `[${d.getMinutes()}:${d.getMilliseconds()}]`;
        if (warningLog) {
            console.log(dateStr + " [WARN] " + warningMsg, warningLog);
        } else {
            console.log(dateStr + " [WARN] > " + warningMsg);
        }

        return Bugsnag.notify(warningName, warningMsg, warningLog, "warning");
    }

    static info(infoName, infoMsg, infoLog) {
        infoLog = infoLog || false;
        const d = new Date();
        const dateStr = `[${d.getMinutes()}:${d.getMilliseconds()}]`;
        if (infoLog) {
            console.log(dateStr + " [INFO] " + infoMsg, infoLog);
        } else {
            console.log(dateStr + " [INFO] > " + infoMsg);
        }

        return Bugsnag.notify(infoName, infoMsg, infoLog, "info");
    }
}
