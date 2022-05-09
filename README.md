# GitHub Team Sync
Syncs users from GitHub team(s) to Codefresh.

## Operation
This program will take a team or teams from GitHub, get the public email address of each user and if they are not already part of your Codefresh organization, invite them to the organization. Additionally, it will look at your organization's users in Codefresh and remove users/emails that are not present in GitHub. This will ensure that your Codefresh users exactly match your GitHub users.

## Argo Events and Workflows
This repository contains a `workflows` subdirectory that contains definitions for use with Argo Events and Workflows, this includes a Calendar (cron) schedule to run the workflow at set intervals and a WorkflowTemplate that defines how to run the application. Configure the options in `workflows/github-team-sync.sensor.yaml` and add the files to your git source to have this run on a schedule.

# Configuration
Details on configuration options can be found in [`config/config.js`](./config/config.js)


## Syncing users from multiple teams
To sync users from multiple teams you must edit `config/config.js` and add multiple organizations/teams to the organizations section:
```json
{
    //...
    organizations: [
        {
            name: "org1",
            teams: [{
                name: "team1",
                permissions: "admin"
            },{
                name: "team2",
                permissions: "admin"
            },
            ]
        },{
            name: "org2",
            teams: [{
                name: "team1",
                permissions: "admin"
            },{
                name: "team2",
                permissions: "admin"
            },
            ]
        },
    ]
    //...
}
```

This can be done within a workflow template by executing a script that updates this file before running the application. Details n hwo ro run a script in argo workflows can be found [here](https://argoproj.github.io/argo-workflows/walk-through/scripts-and-results/).

## Running locally

```bash
docker run -it --rm \
    -e CF_API_KEY=<codefresh-key> \
    -e CF_ACCOUNT_ID=<codefresh-account-id> \
    -e GH_API_KEY=<github-api-key> \
    -e GH_ORG_NAME="my-org" \
    -e GH_TEAM_NAME="devops" \
    quay.io/codefresh_sa/github-team-sync
```