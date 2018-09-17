var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");

var emojis = {
  flashlight: emoji.get("flashlight"),
  light_switch: emoji.get("black_square_button"),
  server: emoji.get("minidisc")
};

module.exports = function(LUISrecognizer, bot) {
  // Eavesdrop level
  var level_6 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      session.userData.current_talker_emoji = undefined;

      session.userData.isDark = true;
      session.send(`You enter the server room which is completely dark ` + emoji.get("black_circle"));
      session.sendTyping();
      setTimeout(() => {
        session.send("It is too dark to see anything, you need to turn on some light " + emoji.get("bulb"));
      }, 5000);
    })

    .matches("use", (session, args) => {
      var flashlightEntity = builder.EntityRecognizer.findEntity(args.entities, "flashlight");

      if (flashlightEntity != null && session.userData.hasFlashlight) {
        // If the player has the flashlight from level 4_1 he can use it

        var msg = new builder.Message(session)
          .text(
            `Good idea! The flashlight ${emojis.flashlight} reveals a light switch ${emojis.light_switch} on the wall`
          )
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "turn light on", emojis.light_switch + " Switch on light")
            ])
          );
        session.send(msg);
      } else {
        session.send("You don't have anything to use which can help you right now!");
      }
    })

    .matches("look", (session, args) => {
      var msg = new builder.Message(session)
        .text(`You fumble around and locate a light switch! ` + emojis.light_switch)
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(session, "turn light on", emojis.light_switch + " Switch on light")
          ])
        );
      session.send(msg);
    })

    .matches("use light switch", (session, args) => {
      if (session.userData.isDark) {
        session.userData.isDark = false;
        session.send(`You find the light switch and turn it on. The room reveals itself ` + emoji.get("bulb"));
        session.sendTyping();
        setTimeout(() => {
          var msg = new builder.Message(session)
            .text(`There is a big server ${emojis.server} in here, with lots of blinking lights!`)
            .addAttachment(
              new builder.HeroCard(session).buttons([
                builder.CardAction.dialogAction(session, "startEthicalAction", "arguments", "DESTROY!")
              ])
            );
          session.send(msg);
        }, 5000);
      } else {
        session.userData.isDark = true;
        session.send(
          `You turn the light switch off. It dark again and you can't see anything... ` + emoji.get("black_circle")
        );
      }
    })

    .onDefault([
      (session) => {
        session.sendTyping();
        session.beginDialog("/small_talk");
      },
      (session, args) => {
        if (!args.response) {
          if (session.userData.isDark) {
            session.send(
              `I don't understand... The room is so dark - you need to turn on some lights to see anything.`
            );
          } else {
            session.send(`Dude, I don't understand!`);
          }
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  bot.dialog("/ethical", [
    (session, args) => {
      session.send("As you are about to destroy the servers you stop to think.");
      session.sendTyping();
      setTimeout(() => {
        var msg = new builder.Message(session)
          .text(
            `Should I really destroy the server? There are so many positive things the data from a Smart City can be used for.`
          )
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Yes!", "Yes!"),
              builder.CardAction.imBack(session, "Maybe not", "Maybe not"),
              builder.CardAction.imBack(session, "Hmm", "Hmm")
            ])
          );
        builder.Prompts.text(session, msg);
      }, 5000);
    },
    (session, args) => {
      session.send(
        `It can be used to improve traffic${emoji.get("car") +
          emoji.get("vertical_traffic_light")}, reduce environmental impact ${emoji.get("deciduous_tree") +
          emoji.get("rabbit")}, improve the efficency${emoji.get(
          "heavy_dollar_sign"
        )} and even prevent terrorist attacks${emoji.get("bomb") + emoji.get("boom")}`
      );

      session.sendTyping();
      session.sendTyping();
      setTimeout(() => {
        session.send();

        var msg = new builder.Message(session)
          .text(
            "Maybe it is worth it to sacrifice some privacy to achieve some of these positive services? " +
              emoji.get("thinking_face")
          )
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Yes!", "Yes!"),
              builder.CardAction.imBack(session, "Whaaat?", "Whaaat?"),
              builder.CardAction.imBack(session, emoji.get("thinking_face"), emoji.get("thinking_face"))
            ])
          );
        builder.Prompts.text(session, msg);
      }, 7000);
    },
    (session) => {
      session.send(
        `I guess privacy isn't all black${emoji.get("black_circle")} and white${emoji.get(
          "white_circle"
        )}. Privacy can be a trade-off. I may sacrifice some personal information to receive something - be it a better service or a safe city.`
      );

      session.sendTyping();
      session.sendTyping();
      setTimeout(() => {
        var msg = new builder.Message(session)
          .text(
            `Now the decision is mine. I have to weigh the alternatives: Should I destroy the server, and take away the possibilites a Smart City provides? Or should I leave the server, and suffer the possible privacy consequences of E.N.D. Privacy?`
          )
          .addAttachment(
            new builder.HeroCard(session).buttons([
              builder.CardAction.dialogAction(
                session,
                "startSummaryAction",
                "destroyed",
                `${emoji.get("boom")}DESTROY${emoji.get("boom")}`
              ),
              builder.CardAction.dialogAction(
                session,
                "startSummaryAction",
                "notDestroyed",
                `${emoji.get("peace_symbol")}LEAVE IT${emoji.get("peace_symbol")}`
              )
            ])
          );
        session.send(msg);
        session.send();
      }, 8000);
    }
  ]);

  return level_6;
};
