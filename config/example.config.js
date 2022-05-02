module.exports = {
    DRY_RUN: false,
    DEBUG: false,
    NO_DELETE: false,
    codefresh: {
        apiKey: process.env.CF_API_KEY,
        accountId: '<codefresh-account-id>',
        // user's email to retain even if they are not on any github org/team
        superadmin: 'noone@local'
    },
    github: {
        accessToken: process.env.GH_API_KEY
    },
    organizations: [
        {
            name: "<github-org>",
            teams: [{
                name: "<github-team>",
                permissions: "<codefresh-permssions-level(user|admin)>"
            }]
        },
    ]
};