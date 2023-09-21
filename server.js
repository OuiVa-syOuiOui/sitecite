const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const sftpClient = require('ssh2-sftp-client');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const SFTP_CONFIG = {
    host: 'msr1072.minestrator.com',
    port: 2022,
    username: 'sushi12.9f2a2734',
    password: '9678Tue496Jul-MSR'
};

async function uploadToSFTP(localPath, remotePath) {
    const sftp = new sftpClient();
    try {
        await sftp.connect(SFTP_CONFIG);
        await sftp.put(localPath, remotePath);
    } catch (error) {
        console.error('Erreur lors de l\'upload vers SFTP:', error);
    } finally {
        await sftp.end();
    }
}

app.get('/getMinecraftData', (req, res) => {
    fs.readFile('minecraft-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON :', err);
            res.status(500).send('Erreur lors de la lecture du fichier JSON');
            return;
        }
        res.send(data);
    });
});

app.post('/updateMinecraftData', (req, res) => {
    const minecraftData = req.body;

    fs.writeFile('minecraft-data.json', JSON.stringify(minecraftData, null, 2), async (err) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du fichier JSON :', err);
            res.status(500).send('Erreur lors de la mise à jour du fichier JSON');
            return;
        }
        console.log('Fichier JSON mis à jour avec succès.');
        await uploadToSFTP('minecraft-data.json', '/plugins/cite/minecraft-data.json');
        res.sendStatus(200);
    });
});

app.listen(port, () => {
    console.log(`SIU ${port}`);
});
