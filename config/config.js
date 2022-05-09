module.exports = {
    // Don't run any user modification operations
    DRY_RUN: process.env.DRY_RUN === "true",
    // Display debug messages
    DEBUG: process.env.DEBUG === "true",
    // Don't delete existing users in Codefresh, only add new users
    NO_DELETE: process.env.NO_DELETE === "true",
    // Codefresh configuration
    codefresh: {
        apiKey: process.env.CF_API_KEY,
        // Codefresh account id #
        accountId: process.env.CF_ACCOUNT_ID,
        // user's email to retain even if they are not on any github org/team (will not add this user, only prevent it from being removed)
        superadmin: process.env.CF_SUPERADMIN_EMIAL || "admin@local"
    },
    github: {
        accessToken: process.env.GH_API_KEY
    },
    // GitHub organization(s) information to sync with
    organizations: [
        {
            // Your GitHub organization name
            name: process.env.GH_ORG_NAME,
            teams: [{
                // Your GitHub team name
                name: process.env.GH_TEAM_NAME,
                // permissions level to import users from this team with (admin|user)
                permissions: process.env.GH_TEAM_PERMISSIONS || "admin"
            }]
        },
    ]
};