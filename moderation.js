const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function moderate (answer) {
    const response = await openai.createModeration({
      input: answer,
      });
    return response.data.results[0].flagged;
  }


module.exports = { moderate };
