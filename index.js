
const { promises: fs } = require('fs')
const path = require('path')
const simpleGit = require('simple-git')
const core = require('@actions/core');
const github = require('@actions/github');


const baseDir = process.cwd()
const git = simpleGit({ baseDir })

const directory = 'text_files'
const outputFile = 'together.txt'

async function run(){
    try {
       
        const files = await fs.readdir(directory);

        let acc = '';
        for (let file of files) {
            const data = await fs.readFile(path.join(directory, file), 'utf8');
            acc += data.endsWith('\n') ? data : data + '\n';
        }

        console.log(acc);

        const outputFilePath = path.join(directory, outputFile);
        await fs.writeFile(outputFilePath, acc)

        await git
            .addConfig('user.email', 'christopher.langager@gmail.com')
            .addConfig('user.name', 'Chris Langager')
            .add(outputFilePath)
            .commit(`updated ${outputFilePath}`)
            .push('origin', 'main');


        // `who-to-greet` input defined in action metadata file
        const nameToGreet = core.getInput('who-to-greet');
        console.log(`Hello ${nameToGreet}!`);
        
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);
      
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`The event payload: ${payload}`);
      
      } catch (error) {
        core.setFailed(error.message);
      }
}

run()