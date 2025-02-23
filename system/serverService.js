const fetch = require('node-fetch');
const { generateRandomPassword } = require('./utilityService');

async function createAccountAndServer(email, username, memory, disk, cpu, domain, apikey, egg, location, sendEmail) {
    try {
        let password = generateRandomPassword();
        let response = await fetch(`${domain}/api/application/users`, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apikey}`
            },
            body: JSON.stringify({
                email: email,
                username: username,
                first_name: username,
                last_name: username,
                language: "en",
                password: password
            })
        });

        let data = await response.json();
        if (data.errors) return;
        let user = data.attributes;

        let eggResponse = await fetch(`${domain}/api/application/nests/5/eggs/${egg}`, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apikey}`
            }
        });

        let eggData = await eggResponse.json();
        let startup_cmd = eggData.attributes.startup;

        let serverResponse = await fetch(`${domain}/api/application/servers`, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apikey}`
            },
            body: JSON.stringify({
                name: username,
                description: " ",
                user: user.id,
                egg: parseInt(egg),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
                startup: startup_cmd,
                environment: {
                    INST: "npm",
                    USER_UPLOAD: "0",
                    AUTO_UPDATE: "0",
                    CMD_RUN: "npm start"
                },
                limits: {
                    memory: memory,
                    swap: 0,
                    disk: disk,
                    io: 500,
                    cpu: cpu
                },
                feature_limits: {
                    databases: 5,
                    backups: 5,
                    allocations: 1
                },
                deploy: {
                    locations: [parseInt(location)],
                    dedicated_ip: false,
                    port_range: []
                }
            })
        });

        let serverData = await serverResponse.json();
        if (serverData.errors) return;
        let server = serverData.attributes;

        sendEmail(email, user, password, server);

    } catch (error) {
        console.error("Error:", error);
    }
}

module.exports = {
    createAccountAndServer
};
