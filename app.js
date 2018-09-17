/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require("restify");
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var emoji = require("node-emoji");
var globals = require("./globals/globals");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
  console.log("%s listening to %s", server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
  openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users
server.post("/api/messages", connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var accountName = process.env.AccountName;
var accountKey = process.env.AccountKey;
var tableName = "botdata";
var azureTableClient = new botbuilder_azure.AzureTableClient(
  tableName,
  `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey${accountKey};`
);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set("storage", tableStorage);

// Set up storage
var storage = require("./storage/storage");
storage.setUp();

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName;

const LuisModelUrl =
  "https://" + luisAPIHostName + "/luis/v1/application?id=" + luisAppId + "&subscription-key=" + luisAPIKey;

// Always send typing indicator
bot.use(builder.Middleware.sendTyping());

// Append emojis to dialogs with other "people"
bot.use({
  // When the bot receives a message
  botbuilder: function(session, next) {
    if (session.userData.lastActive) {
      var millisecondsTimeout = 86400000;
      if (Date.now() - session.userData.lastActive > millisecondsTimeout) {
        console.log("TIMEOUT RESTARTING GAME");
        session.send("You spent too much time without responding. Restarting the game...");
        session.userData = {};
        session.clearDialogStack();
      }
    }
    session.userData.lastActive = Date.now();

    // Log all communication with the bot
    if (process.env.LOG_MESSAGES == "true" && session.message.text) {
      console.log(session.message.user.name + ": " + session.message.text);
    }
    next();
  },
  // When the bot sends a message
  send: function(event, next) {
    bot.loadSession(event.address, (error, session) => {
      if (event.text && session.userData.current_talker_emoji) {
        var preText = session.userData.current_talker_emoji + ": ";
        event.text = preText + event.text;
      }
      // Time limit
      if (session.userData.statistics) {
        var minutes = Math.floor((Date.now() - session.userData.statistics.startTime) / 1000 / 60);
        if (minutes >= globals.time_limit) {
          //TODO: send to questionnaire finish game
        }
      }
      next();
    });
  }
});

// Define the recognizer used in the dialogs.
var LUISrecognizer = new builder.LuisRecognizer(LuisModelUrl);

var root = require("./dialogs/root")(LUISrecognizer, bot);
var intro = require("./dialogs/levels/intro")(LUISrecognizer);
var small_talk = require("./dialogs/small_talk")(LUISrecognizer);

var level_0 = require("./dialogs/levels/level_0")(LUISrecognizer, bot);
var level_1 = require("./dialogs/levels/level_1")(LUISrecognizer, bot);
var level_2 = require("./dialogs/levels/level_2")(LUISrecognizer, bot);
var level_3 = require("./dialogs/levels/level_3")(LUISrecognizer, bot);
var level_4_1 = require("./dialogs/levels/level_4_1")(LUISrecognizer, bot);
var level_4_2 = require("./dialogs/levels/level_4_2")(LUISrecognizer, bot);
var level_5_1 = require("./dialogs/levels/level_5_1")(LUISrecognizer, bot);
var level_5_2 = require("./dialogs/levels/level_5_2")(LUISrecognizer, bot);
var level_6 = require("./dialogs/levels/level_6")(LUISrecognizer, bot);
var summary = require("./dialogs/levels/summary")(LUISrecognizer, bot);

// Define the dialog paths
bot
  .dialog("/", root)
  // Global actions to jump between levels etc.
  .triggerAction({
    // The user can request this at any time.
    // Once triggered, it clears the stack and prompts the main menu again.
    matches: [
      /^reset_game$/i,
      /^level_0$/i,
      /^level_1$/i,
      /^level_2$/i,
      /^level_3$/i,
      /^level_4_1$/i,
      /^level_4_2$/i,
      /^level_5_1$/i,
      /^level_5_2$/i,
      /^level_6$/i,
      /^level_summary$/i
    ],
    onSelectAction: (session, args, next) => {
      var command = args.intent.matched[0];
      session.userData.fname = session.message.user.name.split(" ")[0];
      session.clearDialogStack();
      session.userData.current_talker_emoji = undefined;

      if (!session.userData.statistics) {
        globals.setUpStatistics(session);
      }

      if (command == "reset_game") {
        session.send("Ressetting the bot to root dialog.");
        session.beginDialog("/", args);
      }
      if (command == "level_0") {
        session.send("Restarting game..");
        session.beginDialog("/level/0");
      }
      if (command == "level_1") {
        session.send("Jumping to level 1.");
        session.beginDialog("/level/1");
      }
      if (command == "level_2") {
        session.send("Jumping to level 2.");
        session.beginDialog("/level/2");
      }
      if (command == "level_3") {
        session.send("Jumping to level 3.");
        session.beginDialog("/level/3");
      }
      if (command == "level_4_1") {
        session.send("Jumping to level 4_1.");
        session.beginDialog("/level/4_1");
      }
      if (command == "level_4_2") {
        session.send("Jumping to level 4_2.");
        session.beginDialog("/level/4_2");
      }
      if (command == "level_5_1") {
        session.send("Jumping to level 5_1.");
        session.beginDialog("/level/5_1");
      }
      if (command == "level_5_2") {
        session.send("Jumping to level 5_2.");
        session.beginDialog("/level/5_2");
      }
      if (command == "level_6") {
        session.send("Jumping to level 6.");
        session.beginDialog("/level/6");
      }
      if (command == "level_summary") {
        session.send("Jumping to summary.");
        session.beginDialog("/level/summary");
      }
    }
  });

bot.dialog("/level/intro", intro);
bot.dialog("/level/0", level_0);
bot.dialog("/level/1", level_1);
bot.dialog("/level/2", level_2);
bot.dialog("/level/3", level_3);
bot.dialog("/level/4_1", level_4_1);
bot.dialog("/level/4_2", level_4_2);
bot.dialog("/level/5_1", level_5_1);
bot.dialog("/level/5_2", level_5_2);
bot.dialog("/level/6", level_6);
bot.dialog("/level/summary", summary);

bot.dialog("/small_talk", small_talk);

// Global dialog actions triggered from anywhere
bot.beginDialogAction("startGameAction", "/level/intro");
bot.beginDialogAction("startLevel0Action", "/level/0");
bot.beginDialogAction("startLevel1Action", "/level/1");
bot.beginDialogAction("startLevel2Action", "/level/2");
bot.beginDialogAction("startLevel3Action", "/level/3");
bot.beginDialogAction("startLevel4_1Action", "/level/4_1");
bot.beginDialogAction("startLevel4_2Action", "/level/4_2");
bot.beginDialogAction("startLevel5_1Action", "/level/5_1");
bot.beginDialogAction("startLevel5_2Action", "/level/5_2");
bot.beginDialogAction("startLevel6Action", "/level/6");
bot.beginDialogAction("startSummaryAction", "/level/summary");
bot.beginDialogAction("startQuizAction", "/quiz");
bot.beginDialogAction("startReceptionistAction", "/receptionist");
bot.beginDialogAction("startPrivacyClassificationAction", "/privacy_classification_intro");
bot.beginDialogAction("startInterviewAction", "/interview");
bot.beginDialogAction("startEthicalAction", "/ethical");

// Do not persist userData across conversations
//bot.set(`persistUserData`, false);

// Set up HTML page
server.get(
  /\/(.*)?.*/,
  restify.plugins.serveStatic({
    directory: "./public/",
    default: "index.html"
  })
);

bot.on("conversationUpdate", function(message) {
  if (message.membersAdded) {
    message.membersAdded.forEach(function(identity) {
      if (
        identity.id === message.address.bot.id &&
        (message.address.channelId == "webchat" || message.address.channelId == "emulator")
      ) {
        console.log("Conversation started on channel: " + message.address.channelId);
        bot.send(
          new builder.Message()
            .address(message.address)
            .text("Hello! I'm a the PrivaCity bot. Say something to get started!")
        );
      }
    });
  }
});
