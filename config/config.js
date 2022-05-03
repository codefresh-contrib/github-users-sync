module.exports = {
    DRY_RUN: process.env.DRY_RUN === "true",
    DEBUG: process.env.DEBUG === "true",
    NO_DELETE: process.env.NO_DELETE === "true",
    codefresh: {
        apiKey: process.env.CF_API_KEY,
        accountId: process.env.CF_ACCOUNT_ID,
        // user's email to retain even if they are not on any github org/team (will not add this user, only prevent it from being removed)
        superadmin: process.env.CF_SUPERADMIN_EMIAL || "admin@local"
    },
    github: {
        accessToken: process.env.GH_API_KEY
    },
    organizations: [
        {
            name: process.env.GH_ORG_NAME,
            teams: [{
                name: process.env.GH_TEAM_NAME,
                permissions: process.env.GH_TEAM_PERMISSIONS
            }]
        },
    ]
};