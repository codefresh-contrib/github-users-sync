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
    emails: process.env.EMAILS?.split(','),
    userPermissions: process.env.GH_TEAM_PERMISSIONS || "admin"
};