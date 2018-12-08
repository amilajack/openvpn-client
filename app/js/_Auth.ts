/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Auth {

    static logout() {
        window.connectionTimeout = false;
        window.pendingCallback = false;
        window.connected = false;
        window.App.advsettings.set('vpnUsername', '');
        window.App.advsettings.set('vpnPassword', '');
        hideAll();
        return $('.login').show();
    }

    static login() {
        const username = $('#username').val();
        const password = $('#password').val();
        if ((username === '') || (password === '')) {
            return $('#invalidLogin').show();
        } else {
            const auth = `Basic ${new Buffer(username + ":" + password).toString("base64")}`;
            return request({
                url: 'http://api.vpn.ht:8080/servers',
                headers: {
                    Authorization: auth
                }
            }
                , function(error, response, body) {
                    if (response.statusCode === 401) {
                        $('#invalidLogin').show();
                        return $('#vpn-information').hide();
                    } else {
                        if (window) {
                            // we have successful login so we save it to PT
                            window.App.advsettings.set('vpnUsername', username);
                            window.App.advsettings.set('vpnPassword', password);

                            // we save our user info
                            window.vpn = JSON.parse(body);

                            // bugsnag
                            window.Bugsnag.user =
                                {id: username};

                            // we show our details page
                            Details.open();
                            window.pendingCallback = true;
                            return checkStatus();
                        }
                    }
            });
        }
    }
}
