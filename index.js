require('dotenv').config()
const moderation = require("./moderation");
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
  console.log('Error connecting to database', error)
})

const app = express()
const port = process.env.PORT || 4000
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Welcome to the AskGPT3 Chatbot for Zoom!')
})

app.get('/authorize', (req, res) => {
  res.redirect('https://zoom.us/launch/chat?jid=robot_' + process.env.zoom_bot_jid)
})

app.get('/support', (req, res) => {
  res.send('Contact normandmickey@gmail.com for support.')
})

app.get('/privacy', (req, res) => {
  res.send('The AskGPT3 Chatbot for Zoom does not store any user data.')
})

app.get('/terms', (req, res) => {
  res.send('By installing the AskGOT3 Chatbot for Zoom, you are accept and agree to these terms...')
})

app.get('/documentation', (req, res) => {
  res.send('Try asking "How many feet are there in a mile?" to get the answer, or anything else you have in mind!')
})

app.get('/zoomverify/verifyzoom.html', (req, res) => {
  res.send(process.env.zoom_verification_code)
})

app.post('/askgpt3', (req, res) => {
  if (req.headers.authorization === process.env.zoom_verification_token) {
    res.status(200)
    res.send()
    pg.query('SELECT * FROM chatbot_token', (error, results) => {
      if (error) {
        console.log('Error getting chatbot_token from database.', error)
      } else {
        if (results.rows[0].expires_on > (new Date().getTime() / 1000)) {
          chatbotToken = results.rows[0].token
          askGPT3(req.body.payload.cmd)
             .then(function(result){
          moderation.moderate(result)
             .then(function(flagged){
             if (flagged === false){
                sendChat(result, chatbotToken)
             } else {
                sendChat("Response flagged by OpenAI moderation endpoint.", chatbotToken)
             }
             })
           })

        } else {
          getChatbotToken()
        }
      }
    })
  } else {
    res.status(401)
    res.send('Unauthorized request to AskGPT3 Chatbot for Zoom.')

  }

  async function askGPT3 (question) {
    const response = await openai.createChatCompletion({
      model: process.env.OPENAI_CHAT_MODEL,
      messages: [{role: "user", content: question}],
      });
    return response.data.choices[0].message.content;
  }

  function sendChat (chatBody, chatbotToken) {
    request({
      url: 'https://api.zoom.us/v2/im/chat/messages',
      method: 'POST',
      json: true,
      user_jid: "",
      body: {
        'robot_jid': process.env.zoom_bot_jid,
        'to_jid': req.body.payload.toJid,
        'account_id': req.body.payload.accountId,
        'content': {
          'head': {
            'text': chatBody,
          }
        },
        'user_jid': req.body.payload.toJid,
      },
      headers: {
        'Authorization': 'Bearer ' + chatbotToken
      }
    }, (error, httpResponse, body) => {
      if (error) {
        console.log('Error sending chat.', error)
      } else {
        console.log('Sent chat')
      }
    })
  }

  function getChatbotToken () {
    request({
      url: `https://api.zoom.us/oauth/token?grant_type=client_credentials`,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.zoom_client_id + ':' + process.env.zoom_client_secret).toString('base64')
      }
    }, (error, httpResponse, body) => {
      if (error) {
        console.log('Error getting chatbot_token from Zoom.', error)
      } else {
        body = JSON.parse(body)

        pg.query(`UPDATE chatbot_token SET token = '${body.access_token}', expires_on = ${(new Date().getTime() / 1000) + body.expires_in}`, (error, results) => {
          if (error) {
            console.log('Error setting chatbot_token in database.', error)
          } else {
            //getPhoto(body.access_token)
          }
        })
      }
    })
  }
})


app.post('/deauthorize', (req, res) => {
  if (req.headers.authorization === process.env.zoom_verification_token) {
    res.status(200)
    res.send()
    request({
      url: 'https://api.zoom.us/oauth/data/compliance',
      method: 'POST',
      json: true,
      body: {
        'client_id': req.body.payload.client_id,
        'user_id': req.body.payload.user_id,
        'account_id': req.body.payload.account_id,
        'deauthorization_event_received': req.body.payload,
        'compliance_completed': true
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(process.env.zoom_client_id + ':' + process.env.zoom_client_secret).toString('base64'),
        'cache-control': 'no-cache'
      }
    }, (error, httpResponse, body) => {
      if (error) {
        console.log(error)
      } else {
        console.log(body)
      }
    })
  } else {
    res.status(401)
    res.send('Unauthorized request to AskGPT3 Chatbot for Zoom.')
  }
})

app.listen(port, () => console.log(`AskGPT3 Chatbot for Zoom listening on port ${port}!`))
