/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
$(function() {
    $('#username,#password').keypress(function(e) {
        if (e.which === 13) { return Auth.login(); }
    });

    $('#login').on('click', () => Auth.login());

    $('#logoutBtn').on('click', () => Auth.logout());

    $('#connectBtn').on('click', () => App.VPN.connect($('#protocol').val()));

    $('#cancelBtn,#disconnectBtn').on('click', () => App.VPN.disconnect());

    $('#createAccount').on('click', () => gui.Shell.openExternal('https://vpn.ht/popcorntime?utm_source=pt&utm_medium=client&utm_campaign='));

    $('#helpBtn,#helpdeskBtn').on('click', () => gui.Shell.openExternal('https://vpn.ht/contact'));

    $('#forgotPassword').on('click', () => gui.Shell.openExternal('https://vpn.ht/forgot'));

    return $('#showDetail').on('click', () => Details.open());
});
