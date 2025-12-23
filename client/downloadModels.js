import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)){
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const files = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

const download = async (filename) => {
    const filePath = path.join(modelsDir, filename);
    const url = baseUrl + filename;
    
    console.log(`Downloading ${filename}...`);
    
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Downloaded ${filename}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (err) {
        console.error(`Error downloading ${filename}: ${err.message}`);
    }
};

const downloadAll = async () => {
    for (const file of files) {
        await download(file);
    }
    console.log("All done.");
};

downloadAll();
