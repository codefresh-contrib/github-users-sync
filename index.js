const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');

const config = require('./config/config.js');

const octokit = new Octokit({
    auth: config.github.accessToken,
    userAgent: 'Codefresh Team Sync v1.0.0',
    baseUrl: 'https://api.github.com',
});

const cfBaseUrl = 'https://g.codefresh.io';
const cfRequestHeaders = {
    'Authorization': config.codefresh.apiKey,
    'accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8'
};

async function getGitHubEmails(userList) {
    var emailList = []
    for (idx in userList) {
        var user = userList[idx];
        var email = await getGitHubUserEmail(user.name)
        if (email){
            user.email = email
            emailList.push(user)
        }
    }
    return emailList;
}

async function getGitHubUsers() {
    userList = []
    for (org of config.organizations) {
        for(team of org.teams){

            var users = await getGitHubTeamMembers(org.name, team.name);
            for (user of users){

                // Don't allow duplicate entries in the lsit
                var idx = userList.findIndex(object => object.name === user);
                // if element not in list
                if (idx == -1) {
                    userList.push({"name": user, "permissions": team.permissions })
                } else { // if the user permissions is supposed to be greater than user level, set it
                    if( team.permissions != "user" ){ //if more permissions level added, maybe code them with numbers and compare
                        userList[idx].permissions = team.permissions;
                    }
                }
            }
        }
    }
    return userList;
};

async function getGitHubTeamMembers(org, team){
    return await octokit.rest.teams.listMembersInOrg({
        org: org,
        team_slug: team,
    }).then(response => response.data)
      .then(data =>  {
        var users = []
        for( user of data) {
            users.push(user.login);
        }
        return users
    });
}

async function getGitHubUserEmail(username){
    return await octokit.rest.users.getByUsername({
        username: username
    }).then(response => response.data.email);
}

async function getCodefreshTeamMembers(){
    var url = cfBaseUrl + '/api/accounts/' + config.codefresh.accountId + '/users';
    var options = {
        method: 'get',
        headers: cfRequestHeaders
    }
    return await fetch(url, options)
      .then(data => data.json())
      .then(data => {
        var filtered = []
        for (item of data) {
            filtered.push({
                "id": item._id,
                "name": item.userName,
                "email": item.email,
                "roles": item.roles,
            });
        }
        return filtered;
      });
}

function emailNotInList(searchItems, checkList) {
    notInList = [];
    for(item of searchItems){
        var idx = checkList.findIndex(object => object.email === item.email)
        if (idx == -1) {
            notInList.push(item);
        }
    }
    return notInList;
}

async function addCodefreshUsers(userList) {
    console.log("\nAdding Users to Codefresh");
    for(user of userList) {
        var userId = await addCodefreshUser(user.email);
        console.log(userId);

        var userRole = await addCodefreshUserRole(userId, user.permissions);
    }
}

async function addCodefreshUser(email) {
    console.log("Adding User " + email);

    if( !config.DRY_RUN ) {
        var url = cfBaseUrl + '/api/accounts/' + config.codefresh.accountId + '/adduser';
        var options = {
            method: 'post',
            headers: cfRequestHeaders,
            body: JSON.stringify({ "userDetails": email })
        }
        return await fetch(url, options)
        .then(data => data.json())
        .then(data => data._id)
    } else {
        console.log("\tDry run -- Skipped")
    }
}

async function addCodefreshUserRole(userId, role) {
    console.log("Setting user role " + role);
    if( !config.DRY_RUN ) {
        if ( role == 'admin' ){
            //https://g.codefresh.io/api/accounts/{accountId}/{userId}/admin
            var url = cfBaseUrl + '/api/accounts/' + config.codefresh.accountId + '/' + userId + '/admin';
            var options = {
                method: 'post',
                headers: cfRequestHeaders
            }
            return await fetch(url, options)
            .then(data => data.json()._id)
        }
    } else {
        console.log("\tDry run -- Skipped");
    }
}

async function deleteCodefreshUsers(userList) {
    console.log("\nRemoving Users");
    for(user of userList){
        // saftey to not remove your current user if their email differs from that in github
        if(user.email != config.codefresh.superadmin){
            await deleteCodefreshUser(user.id, user.email)
        }
    }
}
async function deleteCodefreshUser(userId, email) {
    console.log("Removing User " + userId + " (" + email + ")");
    if( !config.DRY_RUN && !config.NO_DELETE) {
        var url = cfBaseUrl + '/api/accounts/' + config.codefresh.accountId + '/' + userId;
        var options = {
            method: 'delete',
            headers: cfRequestHeaders
        }
        return await fetch(url, options);
    } else {
        console.log("\tDry run -- Skipped");
    }
}

function debug(name, value){
    if(config.DEBUG) {
        console.log(`DEBUG: ${name} = ${JSON.stringify(value)}`);
    }
}

async function syncGitHubTeamsToCodefresh(){
    // Get all users of Codefresh account
    var cfTeam = await getCodefreshTeamMembers()
    debug('cfTeam', cfTeam);

    // Get GitHub users for orgs/teams specified
    var userList = await getGitHubUsers();
    debug('userList', userList);

    // Get users' (public) email from GitHub
    var ghUsers = await getGitHubEmails(userList);
    debug('ghUsers', ghUsers);

    // check for github users not in CF team list and add them to codefresh
    var addUsers = await emailNotInList(ghUsers, cfTeam);
    debug('addUsers', addUsers);
    await addCodefreshUsers(addUsers);

    // check for CF team users not in gh list and remove them from codefresh account
    var deleteUsers = await emailNotInList(cfTeam, ghUsers);
    debug('deleteUsers', deleteUsers);
    await deleteCodefreshUsers(deleteUsers);
}



syncGitHubTeamsToCodefresh()