const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 5123;

app.use(cors({
    origin: "http://localhost:5173"
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

    let command;

    switch (queryBuilder) {
        case "default":
            command = `python3 client.py ${resolver} ${resolverPort} ${input} --type ${recordType}`;
            break;
        case "dig":
            command = `dig ${recordType == "PTR" ? "-x" : ""} ${input} ${recordType != "PTR" ? recordType : ""} @${resolver} -p ${resolverPort}`
            break;
        default:
            return res.status(400).json({ error: "invalid query builder" });
    }

    console.log(command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`${error.message}`);
            return res.status(500).json({ error: "Error 😭" });
        }

        if (stderr) {
            console.warn(stderr);
        }

        res.json({ result: stdout })
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
