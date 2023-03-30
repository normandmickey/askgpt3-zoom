# Chatbot for Zoom using ChatGPT (GPT-3.5-Turbo) or GPT-4


## Local/Development Setup

To run the completed Chatbot locally, follow these steps,

1. In terminal:

   `$ git clone https://github.com/normandmickey/askgpt3-zoom.git`

   `$ cd askgpt3-zoom`

   `$ npm install`

   `$ touch .env`

   [Download PostgreSQL here](https://www.postgresql.org/download/) or if on a Mac install using [Homebrew](https://brew.sh/),

   `$ brew install postgresql`

   Once PostgreSQL is installed, follow these commands if you haven’t set it up before,

   `$ brew services start postgresql`

   `$ psql postgres`

   You should be inside the PostgreSQL terminal now and see a `postgres=#` preifx. Now let’s create a database user called "me" with a password of "password"

   `postgres=# CREATE ROLE me WITH LOGIN PASSWORD 'password';`

   `postgres=# ALTER ROLE me CREATEDB;`

   `postgres=# \q`

   You have just added yourself as a user who has the create database permission. Now type this to connect to postgres as your user,

   `$ psql -d postgres -U me`

   Now that PostgreSQL is configured, let’s create a database, connect to it, and create a table to store our access_token. We will also seed our database with a blank access_token and an expires_on date of 1. That way, the first time we call our Zoom Chatbot it will think the access_token is expired. Then it will generate a new one for us, and save it. Run these postgres commands,

   `postgres=> CREATE DATABASE zoom_chatbot;`

   `postgres=> \c zoom_chatbot`

   `zoom_chatbot=> CREATE TABLE chatbot_token (token TEXT,  expires_on NUMERIC);`

   `zoom_chatbot=> INSERT INTO chatbot_token (token, expires_on)  VALUES ('', '1');`

2. Add this code to your `.env` file, replacing the `Required` text with your respective [**Development** Zoom Chatbot API credentials](https://marketplace.zoom.us/docs/guides/getting-started/app-types/create-chatbot-app#register) and  your OpenAI API Key).

   If you followed my instructions on setting up PostgreSQL, don't change the `DATABASE_URL`. If you have setup PostgreSQL before or set it up differently than me reference this `postgres://DBUSERNAME:PASSWORD@SERVER:PORT/DATABASE`.

   ```
   zoom_client_id=Required
   zoom_client_secret=Required
   zoom_bot_jid=Required
   zoom_verification_token=Required
   OPENAI_API_KEY=Required
   OPENAI_CHAT_MODEL=(gpt-3.5-turbo or gpt-4)
   DATABASE_URL=postgres://me:password@localhost:5432/zoom_chatbot
   ```


3. In terminal:

   `$ npm run start` or `$ nodemon` ([for live reload / file change detection](https://www.npmjs.com/package/nodemon))

   `$ ngrok http 4000` ([ngrok turns localhost into live server](https://ngrok.com/) so slash commands and user actions can be sent to your app)

5. Open your ngrok https url in a browser, you should see this,

   `Welcome to the GPT-3 Chatbot for Zoom!`

6. On your App Marketplace Dashboard, add your ngrok https url to your Whitelist URLs (App Credentials Page), **Development** Redirect URL for OAuth (App Credentials Page), and **Development** Bot Endpoint URL (Features Page). Make sure to match the path after your ngrok https url with the express routes in index.js.

   > In order to click the **Save** button on the Features page when adding a Slash Command and Development Bot Endpoint URL, you have to provide a Production Bot Endpoint URL. Feel free to use https://zoom.us as a placeholder.

   After that, your app is ready to be installed!

7. On your App Marketplace Dashboard, go to the **Local Test** page and click **Install**. After you click the **Authorize** button, you should be taken to your redirect url and see this,

   `Thanks for installing the GPT-3 Chatbot for Zoom!`


8. Now that your Chatbot is installed on your Zoom account, go to a Zoom Chat channel and type,

   `/askgpt3 How many feet in a mile?`
   
   
   
 If you need help deploying this app or would like me to install it for you contact me directly at normandmickey@gmail.com or [visit listing on Fiverr](https://www.fiverr.com/normandmickey/build-your-gpt3-or-gpt4-slack-bot?context_referrer=search_gigs&source=top-bar&ref_ctx_id=80b1503ecadb8ca1f46bb1ada17a4d23&pckg_id=1&pos=2&context_type=auto&funnel=80b1503ecadb8ca1f46bb1ada17a4d23&seller_online=true&imp_id=10a5bb14-de82-401f-ac61-a3be470f5524).

