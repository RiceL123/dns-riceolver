const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 5123;

const resolverPort = 5321;

app.use(express.json());

app.post('/api/query', (req, res) => {
    const { domainName } = req.body;
    if (!domainName) {
        return res.status(400).json({ error: "domainName missing" });
    }

    const digCommand = `dig ${domainName} @127.0.0.1 -p ${resolverPort}`;

    exec(digCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing dig: ${error.message}`);
            return res.status(500).json({ error: "Failed to resolve domain" });
        }

        if (stderr) {
            console.warn(`dig stderr: ${stderr}`);
        }
        
        res.json({ result: stdout })
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
