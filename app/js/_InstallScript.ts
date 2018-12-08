/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class InstallScript {

    static open() {
        Debug.info('InstallScript', 'Show Install Script');
        hideAll();
        return $('.installScript').show();
    }
}
