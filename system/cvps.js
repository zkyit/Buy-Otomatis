require('./settings.js');
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

function generateRandomPassword() {
    return Math.random().toString(36).substr(2, 5);
}

function sendEmailVps(email, hostname, ip, password, image, size, region) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: `${mail}`,
            pass: `${pass}`
        }
    });

    let mailOptions = {
        from: `${mail}`,
        to: email,
        subject: 'Vps Details',
        html: `
            <h3>Hi ${user.hostname},</h3>
            <p>Your Vps have been successfully created. Here are the details:</p>
            <ul>
                <li><strong>Hostname:</strong> ${hostname}</li>
                <li><strong>IpV4:</strong> ${ip}</li>
                <li><strong>Password:</strong> ${password}</li>
                <li><strong>Image:</strong> ${image} MB</li>
                <li><strong>Size:</strong> ${size} MB</li>
                <li><strong>Region:</strong> ${region}%</li>
            </ul>
            <p>Thank you for your purchase.</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}

async function createVPS({ email, hostname, size, image, region }) {

    let password = await generateRandomPassword();

    let dropletData = {
        name: hostname.toLowerCase(),
        region: region,
        size: size,
        image: image,
        ssh_keys: null,
        backups: false,
        ipv6: true,
        user_data: `#cloud-config
password: ${password}
chpasswd: { expire: False }`,
        private_networking: null,
        volumes: null,
        tags: ["T"]
    };

    try {
        let response = await fetch("https://api.digitalocean.com/v2/droplets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apido}`
            },
            body: JSON.stringify(dropletData)
        });

        let responseData = await response.json();

        if (!response.ok) {
            throw new Error(`Gagal membuat VPS: ${responseData.message}`);
        }

        let droplet = responseData.droplet;
        let dropletId = droplet.id;

        console.log(`VPS sedang diproses...`);
        await new Promise(resolve => setTimeout(resolve, 60000));

        let dropletResponse = await fetch(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apido}`
            }
        });

        let dropletDataFinal = await dropletResponse.json();
        let dropletInfo = dropletDataFinal.droplet;

        let ipVPS = dropletInfo.networks.v4?.[0]?.ip_address || "Tidak ada alamat IP tersedia";

        return {
            success: true,
            message: "VPS berhasil dibuat!",
            data: {
                id: dropletId,
                email,
                ip: ipVPS,
                password: password,
                name: dropletInfo.name,
                region: dropletInfo.region.slug,
                size: dropletInfo.size_slug,
                image: dropletInfo.image.slug,
                status: dropletInfo.status,
                created_at: dropletInfo.created_at
            }
        };
        
    } catch (err) {
        console.error(err);
        return {
            success: false,
            message: `Terjadi kesalahan saat membuat VPS: ${err.message}`
        };
    }
}

module.exports = { sendEmailVps, createVPS }
