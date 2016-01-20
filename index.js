var _ = require('lodash'),
    util = require('./util.js'),
    google = require('googleapis'),
    service = google.drive('v3');

var pickInputs = {
        'pageToken': { key: 'pageToken', validate: { req: true } },
        'includeRemoved': { key: 'includeRemoved', type: 'boolean' },
        'restrictToMyDrive': { key: 'restrictToMyDrive', type: 'boolean' },
        'spaces': 'spaces'
    },

    pickOutputs = {
        kind: { keyName: 'changes', fields: ['kind'] },
        fileId: { keyName: 'changes', fields: ['fileId'] },
        removed: { keyName: 'changes', fields: ['removed'] },
        time: { keyName: 'changes', fields: ['time'] },
        file: { keyName: 'changes', fields: ['file'] }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var OAuth2 = google.auth.OAuth2,
            oauth2Client = new OAuth2(),
            credentials = dexter.provider('google').credentials();
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validateErrors)
            return this.fail(validateErrors);

        // set credential
        oauth2Client.setCredentials({
            access_token: _.get(credentials, 'access_token')
        });
        google.options({ auth: oauth2Client });
        service.changes.list(inputs, function (error, data) {
            if (error)
                this.fail(error);
             else
                this.complete(util.pickOutputs(data, pickOutputs));
        }.bind(this));
    }
};
