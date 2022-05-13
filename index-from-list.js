const fetch = require('node-fetch');

const config = require('./config/config-from-list.js');

const cfBaseUrl = 'https://g.codefresh.io';
const cfRequestHeaders = {
    'Authorization': config.codefresh.apiKey,
    'accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8'
};

async function getEmailsFromList(){
    var emailsList = []
    for (email of config.emails) {
        emailsList.push({"email": email?.trim(), "permissions": config.userPermissions});
    }
    return emailsList;
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
        debug("userId", userId)

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

// The program entrypoint
async function syncGitHubTeamsToCodefresh(){
    // Get all users of Codefresh account
    var cfTeam = await getCodefreshTeamMembers()
    debug('cfTeam', cfTeam);

    // Get email from list
    var emailsList = await getEmailsFromList()
    debug('emailsList', emailsList);

    // Check for github users not in CF team list and add them to codefresh
    var addUsers = await emailNotInList(emailsList, cfTeam);
    debug('addUsers', addUsers);
    await addCodefreshUsers(addUsers);

    // check for CF team users not in gh list and remove them from codefresh account
    var deleteUsers = await emailNotInList(cfTeam, emailsList);
    debug('deleteUsers', deleteUsers);
    await deleteCodefreshUsers(deleteUsers);
}

syncGitHubTeamsToCodefresh()
