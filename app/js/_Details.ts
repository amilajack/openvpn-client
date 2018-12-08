/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Details {

    static open() {
        let protocols;
        hideAll();
        $('.details').show();

        // put username
        $('.usernameLabel').html(window.vpn.user.username);

        // we check protol
        if (process.platform === "darwin") {
            protocols = ['openvpn'];
        } else if (process.platform === "win32") {
            protocols = ['openvpn', 'pptp'];
        } else if (process.platform === "linux") {
            protocols = ['openvpn'];
        }

        $('#protocol').empty();
        $('#servers').empty();

        return _.each(protocols, protocol => $('#protocol').append(`<option value="${protocol}">${protocol.toUpperCase()}</option>`));
    }
}

        //servers = _.first window.vpn.servers
        //_.each servers, (server) ->
        //    $('#servers').append('<option value="'+server+'">'+server.toUpperCase()+'</option>');
