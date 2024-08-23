"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDataExtraction = AiDataExtraction;
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const apiKey = "sk-proj-vM23bBDexrFGYVlYcqUmT3BlbkFJ0b7ruMYyqDML6xY0kmPx";
const openai = new openai_1.default({ apiKey: apiKey });
async function AiDataExtraction(data) {
    const currentPath = path_1.default.resolve(__dirname);
    const demoPath = path_1.default.join(currentPath, "demo.html");
    const resPath = path_1.default.join(currentPath, "res.json");
    const demo2Path = path_1.default.join(currentPath, "demo2.html");
    const html_with_timing = await fs_1.default.promises.readFile(demoPath, "utf8");
    const response_data = await fs_1.default.promises.readFile(resPath, "utf8");
    const html_with_without_timing = await fs_1.default.promises.readFile(demo2Path, "utf8");
    const response_data_without_timing = "null";
    const prompts = [
        {
            role: "system",
            content: "You are an assistant, skilled in extracting prayer titles and prayer timings and not return any other information except timings and you will return response in same format always.",
        },
        { role: "user", content: html_with_timing },
        { role: "system", content: response_data },
        { role: "user", content: html_with_without_timing },
        { role: "system", content: response_data_without_timing },
        { role: "user", content: data },
    ];
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: prompts,
        stream: false,
    });
    const times = completion.choices[0].message.content;
    if (!times || times === "null") {
        return null;
    }
    return JSON.parse(times);
}
