import fs = require("fs");

const blacklist: Map<string, number> = new Map();

const packet: string =
"server|168.144.45.104\nport|17091\ntype|1\nloginurl|login-page-blond.vercel.app\n#maint|Server currently change hosting, please join discord.gg/mcps to get the latest host.\nbeta_server|127.0.0.1\nbeta_port|17091\nbeta_type|1\nmeta|localhost\nRTENDMARKERBS1001";

const files: Map<string, Buffer> = new Map();

if (fs.existsSync("./assets")) {
    for (let file of fs.readdirSync("./assets")) {
        if (!file.endsWith(".rrtex")) continue;

        files.set(file, fs.readFileSync(`./assets/${file}`));
    }
}

const timeout: number = 10000;

function add_address(address: string) {
    blacklist.set(address, Date.now() + timeout);
}

export default function handler(req: any, res: any) {
    let url = req.url.split("/growtopia/")[1];

    const ip =
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown";

    // SERVER DATA
    if (
        url &&
        url.startsWith("server_data.php") &&
        req.method.toLowerCase() === "post"
    ) {

        if (!blacklist.has(ip + req.url)) {
            add_address(ip + req.url);
        } else {
            let not_allowed = blacklist.get(ip + req.url);

            if (Date.now() < not_allowed!) {
                return res.status(429).send("blocked");
            }

            blacklist.delete(ip + req.url);
        }

        res.setHeader("Content-Type", "text/plain");
        return res.status(200).send(packet);
    }

    // RRTEX
    else if (
        url &&
        files.has(url.replace(/\//g, "")) &&
        req.method.toLowerCase() === "get"
    ) {

        const clean = url.replace(/\//g, "");

        res.setHeader(
            "Content-Type",
            "application/octet-stream"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${clean}`
        );

        return res.status(200).send(files.get(clean));
    }

    return res.status(403).send("forbidden");
}
