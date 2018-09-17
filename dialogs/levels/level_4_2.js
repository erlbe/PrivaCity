var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");

module.exports = function(LUISrecognizer, bot) {
  // Level 1 in the game. Hotel Hallway.

  var level_4_2 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })

    .onBegin((session) => {
      session.userData.lookedAtDoor = false;
      session.userData.pwAttempts_door = 0;
      session.userData.candiesEaten = 0;
      session.userData.solvedEquation = false;
      session.userData.foundPaper = false;
      session.userData.hasCode42 = false;
      session.userData.levelsVisited.level_4_2 = true;
      if (session.userData.sneakyPath) {
        session.send(`On the other side of the hidden door there is a new room. It is full of stuff!`);
      }
      session.sendTyping();
      setTimeout(() => {
        session.send(
          "The room contains a door " +
            emoji.get("door") +
            " a whiteboard filled with equations" +
            emoji.get("memo") +
            " including a marker" +
            emoji.get("lower_left_crayon") +
            " and an eraser" +
            emoji.get("leftwards_arrow_with_hook") +
            "\n\nOn a table there is a sheet of paper" +
            emoji.get("page_facing_up") +
            " and a bowl of candy" +
            emoji.get("candy") +
            "\n\nLastly, there is a painting on the wall. " +
            emoji.get("frame_with_picture")
        );
      }, 4000);
    })
    .matches("look", (session, args) => {
      var whiteboardEntity = builder.EntityRecognizer.findEntity(args.entities, "whiteboard");
      var equationsEntity = builder.EntityRecognizer.findEntity(args.entities, "equations");

      var paintingEntity = builder.EntityRecognizer.findEntity(args.entities, "painting");
      var paperEntity = builder.EntityRecognizer.findEntity(args.entities, "newspaper");
      var doorEntity = builder.EntityRecognizer.findEntity(args.entities, "door");
      var candyEntity = builder.EntityRecognizer.findEntity(args.entities, "candy");
      if (whiteboardEntity != null || equationsEntity != null) {
        session.message.text = "read whiteboard";
        level_4_2.replyReceived(session);
      } else if (paintingEntity != null) {
        if (session.userData.profile_pic) {
          var msg = new builder.Message(session).attachments([
            {
              contentType: "image/jpg",
              contentUrl: session.userData.profile_pic
            }
          ]);
          session.send("What a beautiful picture! Looks familiar " + emoji.get("thinking_face"));
          session.sendTyping();
          session.send(msg);
        } else {
          session.send("The painting is of an orange man with a tupé. Weird...");
        }
        if (session.userData.foundPaper) {
          session.send("Hint: Have you used what you found inside the painting?");
        } else if (session.userData.solvedEquation) {
          session.send("Hint: Have you studied the code language from the whiteboard?");
        }
      } else if (paperEntity != null) {
        session.message.text = "read newspaper";
        level_4_2.replyReceived(session);
      } else if (doorEntity != null) {
        session.message.text = "open door";
        level_4_2.replyReceived(session);
      } else if (candyEntity != null) {
        var msg = new builder.Message(session)
          .text("Lots of candy, do you want one?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Eat candy", "Yes"),
              builder.CardAction.imBack(session, "No", "No")
            ])
          );
        session.send(msg);
      } else {
        var msg = new builder.Message(session)
          .text("Look at what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "read whiteboard", emoji.get("memo") + " Whiteboard"),
              builder.CardAction.imBack(session, "read newspaper", emoji.get("page_facing_up") + " Paper"),
              builder.CardAction.imBack(session, "look at painting", emoji.get("frame_with_picture") + " Painting")
            ])
          );
        session.send(msg);
      }
    })

    .matches("read", (session, args) => {
      var paperEntity = builder.EntityRecognizer.findEntity(args.entities, "newspaper");
      var whiteboardEntity = builder.EntityRecognizer.findEntity(args.entities, "whiteboard");
      if (paperEntity != null) {
        session.send("It's just a boring paper about privacy...");
        var msg = new builder.Message(session).attachments([
          {
            contentType: "image/png",
            contentUrl: "https://i.imgur.com/VRGXODv.png"
          }
        ]);
        session.send(msg);
      } else if (whiteboardEntity != null) {
        if (session.userData.solvedEquation) {
          session.send(
            "Only the code language is left: \n\n L..0..0..k ..  .. i...n5...id.3 ..   ... p..4..i..n..7..i..ng"
          );
        } else {
          var msg = new builder.Message(session)
            .text("The whiteboard is full of weird equations, what can I do with them.." + emoji.get("thinking_face"))
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.postBack(session, "write on whiteboard", emoji.get("lower_left_crayon") + " Write"),
                builder.CardAction.imBack(
                  session,
                  "Erase whiteboard",
                  emoji.get("leftwards_arrow_with_hook") + " Erase"
                ),
                builder.CardAction.postBack(session, "no", "Nothing")
              ])
            );
          session.send(msg);
        }
      } else {
        var msg = new builder.Message(session)
          .text("Read what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Read whiteboard", emoji.get("memo") + " Whiteboard"),
              builder.CardAction.imBack(session, "Read paper", emoji.get("page_facing_up") + " Paper")
            ])
          );
        session.send(msg);
      }
    })

    .matches("look inside", (session, args) => {
      var paintingEntity = builder.EntityRecognizer.findEntity(args.entities, "painting");
      var candyEntity = builder.EntityRecognizer.findEntity(args.entities, "candy");
      if (paintingEntity != null) {
        if (!session.userData.foundPaper) {
          session.userData.foundPaper = true;
          session.send(
            "Inside the picture frame you found a paper with holes cut out " +
              emoji.get("hole") +
              " Wonder what it can be used for..." +
              emoji.get("thinking_face")
          );
          session.sendTyping();
          setTimeout(() => {
            session.send(
              `It has the same size and dimensions as the other sheet of paper${emoji.get(
                "page_facing_up"
              )} in the room...`
            );
          }, 4000);
        } else {
          session.send("There is nothing more there, use what you found..");
        }
      } else if (candyEntity != null) {
        session.message.text = "look at candy";
        level_4_2.replyReceived(session);
      } else {
        session.send("Looking inside my heart, just ones and zeros " + emoji.get("cry"));
      }
    })

    .matches("eat", (session, args) => {
      var candyEntity = builder.EntityRecognizer.findEntity(args.entities, "candy");
      var paperEntity = builder.EntityRecognizer.findEntity(args.entities, "newspaper");

      if (candyEntity != null) {
        if (session.userData.candiesEaten < 3) {
          session.userData.candiesEaten += 1;
          session.send("Mmmm, candy" + emoji.get("yum"));
        } else {
          session.send("No thanks, I don't feel too good" + emoji.get("persevere"));
        }
      } else if (paperEntity != null) {
        session.send("Why would you wanna eat the paper, weirdo..");
      } else {
        var msg = new builder.Message(session)
          .text("Eat what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "eat candy", emoji.get("candy") + " Candy"),
              builder.CardAction.imBack(session, "eat paper", emoji.get("page_facing_up") + " Paper")
            ])
          );
        session.send(msg);
      }
    })

    .matches("erase", (session) => {
      if (!session.userData.solvedEquation) {
        session.userData.solvedEquation = true;
        session.send(
          "You wipe away the equations, but not everything goes away. Seems as some letters and numbers are written with a permanent marker " +
            emoji.get("mag")
        );
        session.sendTyping();
        setTimeout(() => {
          session.send("L..0..0..k ..  .. i...n5...id.3 ..   ... p..4..i..n..7..i..ng");
          session.send("Looks like some kind of code language..");
        }, 2000);
      } else {
        session.send("There is nothing left to erase..");
      }
    })

    .matches("write", [
      (session) => {
        builder.Prompts.text(session, "What do you want to write");
      },
      (session, args) => {
        if (args.response) session.send(`You wrote "${args.response}" on the whiteboard ` + emoji.get("memo"));
        else session.send("nothing, ok..");
      }
    ])

    .matches("open", [
      (session, args) => {
        var doorEntity = builder.EntityRecognizer.findEntity(args.entities, "door");
        var paintingEntity = builder.EntityRecognizer.findEntity(args.entities, "painting");

        if (doorEntity != null) {
          session.userData.pwAttempts_door += 1;
          if (!session.userData.lookedAtDoor) {
            session.userData.lookedAtDoor = true;
            session.send("The door is locked with a keyword" + emoji.get("lock"));
          }
          builder.Prompts.text(session, "Please enter password:");
        } else if (paintingEntity != null) {
          session.message.text = "look inside painting";
          level_4_2.replyReceived(session);
        } else {
          session.message.text = "open door";
          level_4_2.replyReceived(session);
        }
      },
      (session, args, next) => {
        if (args.response.toLowerCase() == globals.password_4_2) {
          session.send("Correct! " + emoji.get("white_check_mark") + " \n\n*door clicks open*");
          session.beginDialog("/level/6");
        } else {
          // Hints
          if (session.userData.pwAttempts_door > 2) {
            if (session.userData.hasCode42) {
              session.send("HINT: You have already found the code, three words..");
            } else if (session.userData.foundPaper) {
              session.send("HINT: Have you used what you found in the painting?");
            } else if (session.userData.solvedEquation) {
              session.send("HINT: You should try to decrypt the code language");
            } else if (!session.userData.solvedEquation) {
              session.send("HINT: Have you looked at the whiteboard?");
            }
          }
          var msg = new builder.Message(session)
            .text(emoji.get("x") + " Wrong, you are still in the room. Do you want to try again?")
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.postBack(session, "open door", "Yes"),
                builder.CardAction.imBack(session, "no", "No")
              ])
            );
          session.send(msg);
        }
      }
    ])

    .matches("use", (session, args) => {
      var paperEntity = builder.EntityRecognizer.findEntity(args.entities, "newspaper");
      var markerEntity = builder.EntityRecognizer.findEntity(args.entities, "pencil");
      if (session.userData.foundPaper && paperEntity != null) {
        var msg = new builder.Message(session)
          .text("What would you like to do with the holed paper you found " + emoji.get("hole"))
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "eat paper", emoji.get("yum") + " Eat paper"),
              builder.CardAction.imBack(session, "put down paper", emoji.get("page_facing_up") + "Lay on top of paper"),
              builder.CardAction.imBack(session, "no", "Nothing")
            ])
          );
        session.send(msg);
      } else if (markerEntity != null) {
        session.message.text = "write on whiteboard";
        level_4_2.replyReceived(session);
      } else {
      }
    })

    .matches("put down", (session, args) => {
      var paperEntity = builder.EntityRecognizer.findEntity(args.entities, "newspaper");
      if (paperEntity != null && session.userData.foundPaper) {
        session.userData.hasCode42 = true;
        session.send("It reveals the code for the door!" + emoji.get("sunglasses"));
        var msg = new builder.Message(session).attachments([
          {
            contentType: "image/png",
            contentUrl: "https://i.imgur.com/jU3s9Fs.png"
          }
        ]);
        session.send(msg);
      } else {
        session.send("I'm not sure I got that..");
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
              )} I didn't quite understand. \n\nHere's some of the stuff you can do` + emoji.get("ok_hand")
            )
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.postBack(session, "Open door", emoji.get("door") + " Open door"),
                builder.CardAction.postBack(session, "Read paper", emoji.get("page_facing_up") + " Read paper"),
                builder.CardAction.postBack(
                  session,
                  "Look at painting",
                  emoji.get("frame_with_picture") + " Admire painting"
                ),
                builder.CardAction.postBack(session, "Eat candy", emoji.get("candy") + " Eat candy"),
                builder.CardAction.postBack(session, "read whiteboard", emoji.get("memo") + " Look at whiteboard")
              ])
            );
          session.send(notUnderstoodResponse);
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  return level_4_2;
};
