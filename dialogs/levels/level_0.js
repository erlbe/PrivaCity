var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");

var emojis = {
  door: emoji.get("door"),
  newspaper: emoji.get("newspaper"),
  water: emoji.get("droplet"),
  key: emoji.get("key")
};

module.exports = function(LUISrecognizer, bot) {
  // Level 0 in the game. Where the player starts
  var level_0 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      // Setup level variables
      session.userData.hasKey = false;
      session.userData.glassEmpty = false;

      globals.setUpStatistics(session);

      session.sendTyping();
      setTimeout(() => {
        session.send(
          `You suddenly wake up in a hotel room. In the room you can see a door ${emojis.door}, a newspaper ${
            emojis.newspaper
          } and a glass of water ${emojis.water}`
        );
      }, 2000);
      session.sendTyping();
      setTimeout(() => {
        session.send("What do you want to do?");
      }, 3000);
    })
    .matches("drink", (session, args) => {
      var drink_itemEntity = builder.EntityRecognizer.findEntity(args.entities, "drink_item");

      if (!session.userData.glassEmpty) {
        session.send(`You drink the glass of water. It was yummy ${emoji.get("yum")}`);
        session.userData.glassEmpty = true;
      } else {
        session.send(`The glass is empty! Nothing to drink.`);
      }
    })
    .matches("open", (session, args) => {
      var doorEntity = builder.EntityRecognizer.findEntity(args.entities, "door");
      var newspaperEntity = builder.EntityRecognizer.findEntity(args.entities, "newspaper");
      // If the entity is not null, then it is a door
      if (doorEntity != null) {
        if (session.userData.hasKey) {
          session.send(`The door opens! ${emojis.key} You go through`);
          session.beginDialog("/level/1");
        } else {
          session.send("The door is locked! You have to find a key..." + emojis.key);
        }
      } else if (newspaperEntity != null) {
        // The player might have said "open newspaper"
        var msg = new builder.Message(session)
          .text(`Read the newspaper?`)
          .addAttachment(
            new builder.HeroCard(session).buttons([builder.CardAction.postBack(session, "Read Newspaper", "Yes")])
          );
        session.send(msg);
      } else {
        var msg = new builder.Message(session)
          .text("Open what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Open door", "Open door"),
              builder.CardAction.imBack(session, "Read newspaper", "Read newspaper")
            ])
          );
        session.send(msg);
      }
    })

    .matches("read", [
      (session, args) => {
        session.send("You pick up the newspaper and read:");

        var msg = new builder.Message(session).attachments([
          {
            contentType: "image/jpeg",
            contentUrl: "https://i.imgur.com/BkXHkhR.png"
          }
        ]);
        session.send(msg);

        session.sendTyping();
        setTimeout(() => {
          builder.Prompts.choice(session, "Press here when you are done reading", "Done", {
            listStyle: 3,
            retryPrompt: "Please press the button " + emoji.get("slightly_smiling_face")
          });
        }, 3000);
      },
      (session, args) => {
        if (!session.userData.hasKey) {
          session.send(
            "You found a key under the newspaper and pick it up! Wonder what it can be used for..." + emojis.key
          );
          session.userData.hasKey = true;
        } else {
          session.send("Hm, wonder what the key can be used for");
        }
      }
    ])

    .matches("use", (session, args) => {
      var keyEntity = builder.EntityRecognizer.findEntity(args.entities, "key");
      var drink_itemEntity = builder.EntityRecognizer.findEntity(args.entities, "drink_item");

      if (keyEntity != null && session.userData.hasKey) {
        var msg = new builder.Message(session)
          .text("Use key for what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Open door", emoji.get("door") + " Open door")
            ])
          );
        session.send(msg);
      } else if (drink_itemEntity != null) {
        session.send(`The glass can't be used for anything...`);
      } else {
        var suggestedActions = [
          builder.CardAction.imBack(session, "Use water glass", emoji.get("droplet") + " Use water glass")
        ];
        if (session.userData.hasKey) {
          suggestedActions.push(builder.CardAction.imBack(session, "Use key", emoji.get("key") + " Use key"));
        }

        var msg = new builder.Message(session)
          .text("Use what?")
          .suggestedActions(builder.SuggestedActions.create(session, suggestedActions));
        session.send(msg);
      }
    })

    .matches("look", (session, args) => {
      var paperEntity = builder.EntityRecognizer.findEntity(args.entities, "newspaper");
      if (paperEntity != null) {
        session.message.text = "read newspaper";
        level_0.replyReceived(session);
      } else {
        session.send(
          `You look around and see the door ${emojis.door}, the newspaper ${emojis.newspaper} and the glass ${
            emojis.water
          }`
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
          var notUnderstoodResponse = new builder.Message(session)
            .text(
              `I'm sorry ${session.message.user.name}. Im just a stupid bot...${emoji.get(
                "worried"
              )} I didn't quite understand. \n\nYou know what? Here are some hints for what you can do in this hotel room` +
                emoji.get("sunglasses")
            )
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "Drink water", emojis.water + "Drink water"),
                builder.CardAction.imBack(session, "Open door", emojis.door + "Open door"),
                builder.CardAction.imBack(session, "Read newspaper", emojis.newspaper + "Read newspaper")
              ])
            );
          session.send(notUnderstoodResponse);
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);
  return level_0;
};
