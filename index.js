
const { promises: fs } = require('fs')
const path = require('path')
const simpleGit = require('simple-git')
const core = require('@actions/core');
const github = require('@actions/github');


const baseDir = process.cwd()
const git = simpleGit({ baseDir })

const inputDirectory = 'text_files'
const outputDirectory = 'generated'
const outputFile = 'together.txt'

async function run(){
    try {

        //Read in the files we want to stitch together
        const files = await fs.readdir(inputDirectory);

        let acc = '';
        for (let file of files) {
            const data = await fs.readFile(path.join(inputDirectory, file), 'utf8');
            acc += data.endsWith('\n') ? data : data + '\n';
        }

        //combine the files and write them to a new one
        const outputFilePath = path.join(outputDirectory, outputFile);
        await fs.writeFile(outputFilePath, acc)


        //push up our new file
        const { pusher }  = github.context.payload
        await git
            .addConfig('user.email', pusher.email)
            .addConfig('user.name', pusher.name)
            .add(outputFilePath)
            .commit(`updated ${outputFilePath}`)
            .push('origin', 'main');
      } catch (error) {
        core.setFailed(error.message);
      }
}

run()