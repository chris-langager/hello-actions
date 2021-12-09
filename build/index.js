"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = __importStar(require("path"));
const simple_git_1 = __importDefault(require("simple-git"));
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const baseDir = process.cwd();
const git = (0, simple_git_1.default)({ baseDir });
const inputDirectory = path.join(baseDir, 'text_files');
const outputDirectory = path.join(baseDir, 'generated');
const outputFile = 'together.txt';
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Read in the files we want to stitch together
        const files = yield fs_1.promises.readdir(inputDirectory);
        let acc = '';
        for (let file of files) {
            const data = yield fs_1.promises.readFile(path.join(inputDirectory, file), 'utf8');
            acc += data.endsWith('\n') ? data : data + '\n';
        }
        //combine the files and write them to a new one
        const outputFilePath = path.join(outputDirectory, outputFile);
        yield fs_1.promises.writeFile(outputFilePath, acc);
        //push up our new file
        const { pusher } = github.context.payload;
        yield git
            .addConfig('user.email', pusher.email)
            .addConfig('user.name', pusher.name)
            .add(outputFilePath)
            .commit(`updated ${outputFilePath}`)
            .push('origin', 'main');
    }
    catch (error) {
        core.setFailed(error.message);
    }
}))();
