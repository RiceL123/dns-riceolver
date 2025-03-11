const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const port = 5123;

app.use(cors({
    origin: ["http://localhost:5173", "https://dns-riceolver.vercel.app"]
}));
app.use(express.json());

app.post('/api/query', (req, res) => {
    console.log(req.body)
    const { input, queryBuilder, recordType, resolver } = req.body.question;
    if (!input) {
        return res.status(400).json({ error: "domainName missing" });
    }

    let resolverPort;
    console.log(resolver);
    if (resolver == "127.0.0.1") {
        resolverPort = 5321;
    } else {
        resolverPort = 53;
    }

    let args = []
    let command;

    switch (queryBuilder) {
        case "default":
            // command = `client.py ${resolver} ${resolverPort} ${input} --type ${recordType}`;
            command = "./client.py";
            args.push(resolver, resolverPort, input, "--type", recordType);
            break;
        case "dig":
            // command = `dig ${recordType == "PTR" ? "-x" : ""} ${input} ${recordType != "PTR" ? recordType : ""} @${resolver} -p ${resolverPort}`
            command = "dig";
            if (recordType === "PTR") args.push("-x");
            args.push(input);
            if (recordType !== "PTR") args.push(recordType);
            args.push(`@${resolver}`, "-p", resolverPort);
            break;
        default:
            return res.status(400).json({ error: "invalid query builder" });
    }

    // console.log(command);
    console.log(args);

    const process = spawn(command, args);

    let output = "";
    process.stdout.on("data", (data) => {
        output += data.toString();
    });

    process.stderr.on("data", (data) => {
        console.error(data.toString());
    });

    process.on("close", (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: "Error 😭" });
        }
        res.json({ result: output });
    });
});

app.get("/healthcheck", (_, res) => {
    return res.status(200);
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
