const { spawn } = require('child_process');

const sentenceContent = "Elvish Yadav, Bigg Boss OTT winner, has been granted bail in the snake venom case after a clerical error by police led to the removal of NDPS charges. His involvement in supplying snake venom for rave parties remains controversial, with two additional arrests made. Yadav's family denies his connection to lavish purchases, claiming his income sources are YouTube and clothing sales.";
const pythonCode = `
import sys
import spacy

nlp = spacy.load('en_core_web_sm')

sentence = "${sentenceContent}"

doc = nlp(sentence)

for ent in doc.ents:
    print(ent.text)
`;

const pythonProcess = spawn('python', ['-c', pythonCode]);

pythonProcess.stdout.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
});

pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
});
