# HenryBot

## Getting the API token for your Slack channel

To allow the HenryBot to connect your Slack channel you must provide him an API key. To retrieve it you need to add a new Bot in your Slack organization by visiting the following url: https://*yourorganization*.slack.com/services/new/bot, where *yourorganization* must be substituted with the name of your organization (e.g. https://*loige*.slack.com/services/new/bot). Ensure you are logged to your Slack organization in your browser and you have the admin rights to add a new bot.

You will find your API key under the field API Token, copy it in a safe place and get ready to use it.

## Configuration

The HenryBot is configurable through environment variables. There are several variable available:

| Environment variable | Description |
|----------------------|-------------|
| `BOT_API_KEY` | this variable is used to specify the API token needed by the bot to connect to your Slack organization |
| `TRANSLATION_API_KEY` | this variable is used to specify the API key need for the Text Analytics from Microsoft Cognitive API Service|

## Launching the bot from source

If you downloaded the source code of the bot you can run it using NPM with:

```bash
$ npm start
```

Don't forget to set your `BOT_API_KEY` and `TRANSLATION_API_KEY` environment variable bedore doing so.
