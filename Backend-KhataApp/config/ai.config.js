import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({ token: process.env.COHERE_SECRET_KEY });
// Async function to get a chat response
export const getAIResponse = async (userMessage) => {
  const messages = [{ role: "user", content: userMessage }];

  const res = await cohere.chat({
    model: "command-r-plus",
    messages,
    // maxTokens: 60,
  });
  console.log("AI says:", res.message.content[0].text);
};
