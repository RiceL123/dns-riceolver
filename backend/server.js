const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 5123;

const resolveIP = "127.0.0.1"
const resolverPort = 5321;

app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());

app.post('/api/query', (req, res) => {
    console.log(req.body)
    const { domainName } = req.body;
    if (!domainName) {
        return res.status(400).json({ error: "domainName missing" });
    }

    // const digCommand = `dig ${domainName} @${resolverIP} -p ${resolverPort}`;

    // exec(digCommand, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error executing dig: ${error.message}`);
    //         return res.status(500).json({ error: "Failed to resolve domain" });
    //     }

    //     if (stderr) {
    //         console.warn(`dig stderr: ${stderr}`);
    //     }
        
    //     res.json({ result: stdout })
    // });

    const command = `python3 client.py ${resolveIP} ${resolverPort} ${domainName}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing client.py: ${error.message}`);
            return res.status(500).json({ error: "Failed to resolve domain" });
        }

        if (stderr) {
            console.warn(`client.py stderr: ${stderr}`);
        }
        
        res.json({ result: stdout })
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
