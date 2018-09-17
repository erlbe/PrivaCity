var builder = require("botbuilder");
var emoji = require("node-emoji");

module.exports = function(LUISrecognizer, bot) {
  var rootDialog = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      session.beginDialog("/smart_city_intro", true);
    })

    .onDefault([
      (session) => {
        session.sendTyping();
        session.beginDialog("/small_talk");
      },
      (session, args) => {
        if (!args.response) {
          session.send("Sorry, I don't understand what you mean! Click the 'Play Game!' button to start the game.");
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  bot.dialog("/smart_city_intro", [
    (session, args) => {
      {
        if (!args) {
          session.send("Please don't interrupt me " + emoji.get("slightly_smiling_face"));
          session.sendTyping();
        } else {
          session.userData.fname = session.message.user.name.split(" ")[0];
          session.send("Hi friend! Nice to talk to you " + emoji.get("grin"));

          session.sendTyping();
          setTimeout(() => {
            builder.Prompts.confirm(session, `Before we start the game. Do you know what a "Smart City" is?`, {
              listStyle: builder.ListStyle.button
            });
          }, 3000);
        }
      }
    },
    (session, args, next) => {
      if (args.response) {
        session.send(`Cool! I see you come prepared. Anyways, here is what I mean when I say Smart City:`);
        session.sendTyping();
        setTimeout(() => {
          next();
        }, 4000);
      } else {
        next();
      }
    },
    (session, args, next) => {
      session.send(
        `A smart city is an urban area that uses different types of digital data collection sensors to supply information which is used to manage the city efficiently ` +
          emoji.get("cityscape")
      );
      session.sendTyping();
      setTimeout(() => {
        session.send(
          `The data can be collected from citizens and devices that is analyzed to monitor and manage traffic and transportation systems ${emoji.get(
            "vertical_traffic_light"
          )}, power plants ${emoji.get("zap")}, water supply networks ${emoji.get(
            "droplet"
          )}, waste management ${emoji.get("wastebasket")}, law enforcement ${emoji.get("cop")}, schools ${emoji.get(
            "school"
          )}, hospitals ${emoji.get("hospital")}, and other community services.`
        );
        next();
      }, 6000);
    },
    (session) => {
      session.sendTyping();
      session.sendTyping();
      setTimeout(() => {
        var msg = new builder.Message(session)
          .text(
            `Now that you know what a Smart City is. Do you want to play the cool game "PrivaCity"? ${emoji.get(
              "sunglasses"
            )}`
          )
          .addAttachment(
            new builder.HeroCard(session).buttons([
              builder.CardAction.dialogAction(session, "startGameAction", "arguments", "Play Game")
            ])
          );
        session.send(msg);
        session.endDialog();
      }, 8000);
    }
  ]);

  return rootDialog;
};
