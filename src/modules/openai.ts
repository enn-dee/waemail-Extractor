import OpenAI from "openai";
import fs from "fs";
import Path from "path";

const apiKey = "sk-proj-vM23bBDexrFGYVlYcqUmT3BlbkFJ0b7ruMYyqDML6xY0kmPx";

const openai = new OpenAI({ apiKey: apiKey });

export interface AiTime {
  name: string;
  azzanTime: string;
  iqamahTime: string;
}

export async function AiDataExtraction(data: string): Promise<AiTime[] | null> {
  const currentPath = Path.resolve(__dirname);
  const demoPath = Path.join(currentPath, "demo.html");
  const resPath = Path.join(currentPath, "res.json");
  const demo2Path = Path.join(currentPath, "demo2.html");
  const html_with_timing = await fs.promises.readFile(demoPath, "utf8");
  const response_data = await fs.promises.readFile(resPath, "utf8");
  const html_with_without_timing = await fs.promises.readFile(
    demo2Path,
    "utf8"
  );
  const response_data_without_timing = "null";

  const prompts: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are an assistant, skilled in extracting prayer titles and prayer timings and not return any other information except timings and you will return response in same format always.",
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
