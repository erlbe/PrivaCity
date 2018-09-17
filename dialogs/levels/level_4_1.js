var builder = require("botbuilder");
var emoji = require("node-emoji");
var privacy_classification = require("../../globals/privacy_classification");
var globals = require("../../globals/globals");

var backToMainLevelPhrase = `You are back in the small room. You can see the file cabinet with drawers ${emoji.get(
  "file_cabinet"
)} and the wardrobe closet ${emoji.get("door")}`;

module.exports = function(LUISrecognizer, bot) {
  // Level 4_1 in the game. Privacy classification.
  var level_4_1 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      // Reset the current talker emoji, just in case
      session.userData.current_talker_emoji = undefined;
      session.userData.levelsVisited.level_4_1 = true;
      // Level variables
      session.userData.hasFlashlight = false;
      session.userData.hasPencil = false;
      session.sendTyping();
      setTimeout(() => {
        session.send(
          `You enter the code and the back door to the city council opens. In the small room there is a file cabinet with drawers ${emoji.get(
            "file_cabinet"
          )} and a wardrobe closet ${emoji.get("door")}`
        );
      }, 3000);
    })

    .matches("open", (session, args) => {
      var cabinetEntity = builder.EntityRecognizer.findEntity(args.entities, "file cabinet");
      var generalDrawerEntity = builder.EntityRecognizer.findEntity(args.entities, "drawer");
      var topDrawerEntity = builder.EntityRecognizer.findEntity(args.entities, "drawer::top drawer");
      var bottomDrawerEntity = builder.EntityRecognizer.findEntity(args.entities, "drawer::bottom drawer");
      var closetEntity = builder.EntityRecognizer.findEntity(args.entities, "closet");

      if (cabinetEntity != null || generalDrawerEntity != null) {
        var msg = new builder.Message(session)
          .text("The file cabinet has two drawers")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Open top drawer", emoji.get("arrow_up") + " Open top drawer"),
              builder.CardAction.imBack(session, "Open bottom drawer", emoji.get("arrow_down") + " Open bottom drawer")
            ])
          );
        session.send(msg);
      } else if (topDrawerEntity) {
        session.send(
          `There is a pencil here ${emoji.get("pencil2")}. You pick it up. Wonder if it can be used for something...`
        );
        session.userData.hasPencil = true;
      } else if (bottomDrawerEntity) {
        session.send(
          `There is a flashlight here ${emoji.get("flashlight")}. You pick it up. That will probably come in handy!`
        );
        session.userData.hasFlashlight = true;
      } else if (closetEntity != null) {
        session.send(`It is completely dark in the closet. I can't see a thing! ` + emoji.get("black_circle"));
        if (session.userData.hasFlashlight) {
          var msg = new builder.Message(session)
            .text(`Wait a minute! I can use the flashlight ` + emoji.get("bulb"))
            .addAttachment(
              new builder.HeroCard(session).buttons([
                builder.CardAction.dialogAction(
                  session,
                  "startPrivacyClassificationAction",
                  "arguments",
                  emoji.get("flashlight") + " Use flashlight"
                )
              ])
            );

          session.sendTyping();
          setTimeout(() => {
            session.send(msg);
          }, 4000);
        } else {
          session.sendTyping();
          setTimeout(() => {
            session.send(
              `It was too scary in the dark closet. I need to find something in the room to light it up! ` +
                emoji.get("bulb")
            );
            session.send(backToMainLevelPhrase);
          }, 4000);
        }
      } else {
        var msg = new builder.Message(session)
          .text("Open what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Open cabinet", emoji.get("file_cabinet") + " Open cabinet"),
              builder.CardAction.imBack(session, "Open closet", emoji.get("door") + " Open closet")
            ])
          );
        session.send(msg);
      }
    })

    .matches("look", (session, args) => {
      var cabinetEntity = builder.EntityRecognizer.findEntity(args.entities, "file cabinet");
      var generalDrawerEntity = builder.EntityRecognizer.findEntity(args.entities, "drawer");
      var closetEntity = builder.EntityRecognizer.findEntity(args.entities, "closet");

      if (cabinetEntity != null || generalDrawerEntity != null) {
        session.message.text = "Open cabinet";
        level_4_1.replyReceived(session);
      } else if (closetEntity != null) {
        session.send("It is a wooden closet. Looks like the door can be opened...");
      } else {
        var msg = new builder.Message(session)
          .text("Look at what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Look at cabinet", emoji.get("file_cabinet") + " Look at cabinet"),
              builder.CardAction.imBack(session, "Look at closet", emoji.get("door") + " Look at closet")
            ])
          );
        session.send(msg);
      }
    })

    .matches("use", [
      (session, args) => {
        var flashlightEntity = builder.EntityRecognizer.findEntity(args.entities, "flashlight");
        var pencilEntity = builder.EntityRecognizer.findEntity(args.entities, "pencil");

        if (flashlightEntity != null && session.userData.hasFlashlight) {
          session.send(
            `Uhh... ${emoji.get("confused")} The room has enough light. I don't want to use up all the battery ` +
              emoji.get("battery")
          );
        } else if (pencilEntity != null && session.userData.hasPencil) {
          session.send(`I don't have anything to write on...`);
          session.sendTyping();
          setTimeout(() => {
            builder.Prompts.text(
              session,
              `But wait! I can write on my hand ${emoji.get("hand")}\n\nWhat do you want to write?`
            );
          }, 3000);
        } else {
          session.send(`Haha, you idiot! I don't think you can't use that ` + emoji.get("poop"));
        }
      },
      (session, results) => {
        if (results.response) {
          session.send(`Allright. "${results.response}" is now written on my hand! ` + emoji.get("grin"));
        }
      }
    ])

    .matches("write", (session) => {
      session.message.text = "use pencil";
      level_4_1.replyReceived(session);
    })

    .onDefault([
      (session) => {
        session.sendTyping();
        session.beginDialog("/small_talk");
      },
      (session, args) => {
        if (!args.response) {
          var notUnderstoodResponse = `Beep boop! ${emoji.get(
            "robot_face"
          )} I didn't understand. Is this what you want, good Sir?`;
          var msg = new builder.Message(session)
            .text(notUnderstoodResponse)
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "Open cabinet", emoji.get("file_cabinet") + " Open cabinet"),
                builder.CardAction.imBack(session, "Open closet", emoji.get("door") + " Open closet")
              ])
            );
          session.send(msg);
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  bot.dialog("/privacy_classification_intro", [
    (session, args) => {
      session.send(
        `In the closet you find a sheet of paper called: "Strategic Plan To Abuse Information In Smart City"`
      );
      session.sendTyping();

      var text = `The sheet contains a list of ways E.N.D Privacy plans to use the information from the Smart City! ${emoji.get(
        "house_with_garden"
      )}\n\nYou must classify the possible uses as either:\n\n•Privacy violation \n\nor \n\n•No violation`;

      session.sendTyping();
      setTimeout(() => {
        session.send(
          builder.Prompts.choice(session, text, ["Begin", "Exit Closet"], {
            listStyle: builder.ListStyle.button
          })
        );
      }, 4000);
    },
    (session, results) => {
      var response = results.response.entity;
      if (response == "Begin") {
        session.replaceDialog("/privacy_classification");
      } else {
        session.endDialog(backToMainLevelPhrase);
      }
    }
  ]);

  bot.dialog("/privacy_classification", [
    (session, args) => {
      // Save previous state (create on first call)
      session.dialogData.index = args ? args.index : 0;

      // Score during the quiz
      session.dialogData.score = args ? args.score : 0;

      // TODO: Add images, etc..
      var index = session.dialogData.index;
      var statement = privacy_classification.statements[index].statement;
      var choices = ["Privacy violation", "No violation"];
      builder.Prompts.choice(session, `S${index + 1}: ` + statement, choices, {
        listStyle: builder.ListStyle.button
      });
    },
    (session, results) => {
      var response = results.response.entity;
      var isViolation = privacy_classification.statements[session.dialogData.index].violation;

      if ((isViolation && response == "Privacy violation") || (!isViolation && response == "No violation")) {
        // Correct
        session.dialogData.score++;
        session.send(
          `${emoji.get("white_check_mark")} Correct! \n\nYou have ${session.dialogData.score} correct answers so far.`
        );
      } else {
        // Incorrect
        session.send(`${emoji.get("x")} Incorrect! \n\nYou have ${session.dialogData.score} correct answers so far.`);
        // Save classifications to use in summary (if not already in the list)
        globals.addToArrayIfNotThere(
          session.userData.statistics.wrongClassifications,
          privacy_classification.statements[session.dialogData.index].statement
        );
      }

      // Provide explanation
      session.sendTyping();
      setTimeout(() => {
        builder.Prompts.choice(
          session,
          privacy_classification.statements[session.dialogData.index].explanation,
          ["Next statement"],
          { listStyle: builder.ListStyle.button }
        );
      }, 3000);
    },
    (session, results) => {
      session.dialogData.index++;
      // Check for end of questions
      if (session.dialogData.index >= privacy_classification.statements.length) {
        // Quiz is done
        session.send(
          `There are no more statements to classify${emoji.get("cry")}\n\nYour final score was: ` +
            session.dialogData.score
        );

        session.send();

        var msg = new builder.Message(session)
          .text(`What's this??? There is a hidden door inside the closet!` + emoji.get("grin"))
          .addAttachment(
            new builder.HeroCard(session).buttons([
              builder.CardAction.dialogAction(
                session,
                "startLevel4_2Action",
                "arguments",
                emoji.get("door") + " Go through!"
              )
            ])
          );

        session.sendTyping();
        setTimeout(() => {
          session.send(msg);
        }, 5000);
      } else {
        // Next question
        session.replaceDialog("/privacy_classification", session.dialogData);
      }
    }
  ]);

  return level_4_1;
};
