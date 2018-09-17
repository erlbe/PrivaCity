var builder = require("botbuilder");
var emoji = require("node-emoji");

var emojis = {
  door: emoji.get("door"),
  elevator: emoji.get("arrow_up_down"),
  icecube_machine: emoji.get("snowflake")
};

module.exports = function(LUISrecognizer, bot) {
  // Level 1 in the game. Hotel Hallway.

  var level_1 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })

    .onBegin((session) => {
      session.send("You receive a message..." + emoji.get("iphone"));
      session.userData.lookedAtElevator = false;
      session.userData.pwAttempts_elevator = 0;
      session.userData.hasReceivedSnapchat = false;
      session.userData.isSharingLocation = false;
      var msg = new builder.Message(session).attachments([
        {
          contentType: "image/png",

          // // For mobile:
          // contentUrl: "https://i.imgur.com/bGUrreM.png"

          // For PC:
          contentUrl: "https://i.imgur.com/8PYX3dK.png"
        }
      ]);
      session.send(msg);
      session.sendTyping();
      setTimeout(() => {
        session.send(
          `You are now in the hallway, there are several other room doors ${emojis.door}, an elevator ${
            emojis.elevator
          } and an ice cube machine ${emojis.icecube_machine}`
        );
      }, 10000);
    })
    .matches("open", [
      (session, args) => {
        var doorEntity = builder.EntityRecognizer.findEntity(args.entities, "door");
        var iceEntity = builder.EntityRecognizer.findEntity(args.entities, "ice cube machine");
        if (doorEntity != null) {
          session.send("This room door is locked, seems like all the other doors are too...");
          if (!session.userData.hasReceivedSnapchat) {
            session.userData.hasReceivedSnapchat = true;
            session.beginDialog("snapchat");
          }
        } else if (iceEntity != null) {
          session.send(`The machine cannot be opened. You can have an ice cube though ${emoji.get("yum")}`);
          if (!session.userData.hasReceivedSnapchat) {
            session.userData.hasReceivedSnapchat = true;
            session.beginDialog("snapchat");
          }
        } else {
          var msg = new builder.Message(session)
            .text("Open what?")
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "Open door", "Open door"),
                builder.CardAction.imBack(session, "Open ice cube machine", "Open ice cube machine"),
                builder.CardAction.imBack(session, "Open elevator", "Open elevator")
              ])
            );
          session.send(msg);
        }
      },
      () => {}
    ])

    .matches("use ice cube machine", [
      (session, args, next) => {
        var iceEntity = builder.EntityRecognizer.findEntity(args.entities, "ice cube machine");

        builder.Prompts.confirm(session, "Do you want an ice cube? " + emoji.get("snowflake"), {
          listStyle: builder.ListStyle.button
        });
      },
      (session, args) => {
        if (args.response == true) {
          session.send("Aaargh, brainfreeze" + emoji.get("tired_face"));
          if (!session.userData.hasReceivedSnapchat) {
            session.userData.hasReceivedSnapchat = true;
            session.beginDialog("snapchat");
          }
        } else {
          session.send("Ok");
          if (!session.userData.hasReceivedSnapchat) {
            session.userData.hasReceivedSnapchat = true;
            session.beginDialog("snapchat");
          }
        }
      },
      () => {}
    ])

    .matches("call elevator", [
      (session, args) => {
        // If looking at elevator for the first time
        if (!session.userData.lookedAtElevator) {
          session.userData.lookedAtElevator = true;
          var playerName = session.message.user.name.toLowerCase();
          var names = playerName.split(" ");
          var shuffled = [];
          // Shuffles each name
          for (i = 0; i < names.length; i++) {
            shuffled[i] = names[i]
              .split("")
              .sort(function() {
                return 0.5 - Math.random();
              })
              .join("");
          }
          session.send(
            "Seems like the elevator is locked with a password" +
              emoji.get("lock") +
              '  \n HINT: "' +
              shuffled[0] +
              " " +
              shuffled[1] +
              '"'
          );
        }
        session.userData.pwAttempts_elevator += 1;
        if (session.userData.pwAttempts_elevator == 3) {
          session.send(
            "HINT: " + session.userData.fname + ", the answer might be on your facebook page.." + emoji.get("mag")
          );
        }
        builder.Prompts.text(session, "Please enter password:");
      },
      (session, args, next) => {
        if (args.response.toLowerCase() == session.message.user.name.toLowerCase()) {
          session.send("Correct! " + emoji.get("white_check_mark") + " \n\n*elevator opens*");
          session.beginDialog("/level/2");
        } else {
          var msg = new builder.Message(session)
            .text("Wrong, you are still in the hallway. Do you want to try again?")
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "call elevator", "Yes"),
                builder.CardAction.imBack(session, "no", "No")
              ])
            );
          session.send(msg);
        }
      }
    ])

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
              )} I didn't quite understand. \n\nWhat do you want to do?`
            )
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "Call elevator", emojis.elevator + " Call elevator"),
                builder.CardAction.imBack(
                  session,
                  "Use ice cube machine",
                  emojis.icecube_machine + " Use ice cube machine"
                ),
                builder.CardAction.imBack(session, "Open door", emojis.door + " Open door")
              ])
            );
          session.send(notUnderstoodResponse);
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  bot.dialog("snapchat", [
    (session) => {
      session.sendTyping();
      setTimeout(() => {
        session.send(`You suddenly receive a notification from Snapchat!`);
        var msg = new builder.Message(session).attachments([
          {
            contentType: "image/png",
            contentUrl: "https://i.imgur.com/rRFSNCq.png"
          }
        ]);
        session.sendTyping();
        setTimeout(() => {
          session.send(msg);
          builder.Prompts.confirm(session, "Would you like to share your location?", {
            listStyle: builder.ListStyle.button
          });
        }, 2000);
      }, 5000);
    },
    (session, args) => {
      if (args.response == true) {
        session.userData.isSharingLocation = true;
        session.send("Thank you, here's your 50kr " + emoji.get("dollar"));
      } else {
        session.send("That's fine! " + emoji.get("money_with_wings") + " No money for you...");
      }
      session.sendTyping();
      setTimeout(() => {
        session.endDialog(
          `You are still in the hallway, there are several other room doors ${emojis.door}, the elevator ${
            emojis.elevator
          } and the ice cube machine ${emojis.icecube_machine}`
        );
      }, 5000);
    },
    (session, results) => {
      if (results.success) {
      } else {
        session.endDialogWithResult({ error: true });
      }
    }
  ]);

  return level_1;
};
