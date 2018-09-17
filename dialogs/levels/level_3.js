var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");

var emojis = {
  man_1: emoji.get("man_with_gua_pi_mao"),
  man_2: emoji.get("man_with_turban"),
  happyBarista: emoji.get("smirk"),
  angryBarista: emoji.get("angry"),
  light_switch: emoji.get("black_square_button"),
  coffe: emoji.get("coffee"),
  friend: emoji.get("man"),
  hiddenMessage: emoji.get("1234")
};

var backToMainLevelPhrase =
  "You are in the cafe, there are two men sitting at another table" +
  emojis.man_1 +
  emojis.man_2 +
  ", the barista is behind the counter" +
  emojis.happyBarista +
  ", a light switch on the wall" +
  emojis.light_switch +
  " and your cup of coffee" +
  emojis.coffe;

module.exports = function(LUISrecognizer, bot) {
  // Level 3 in the game. The cafe.
  var level_3 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      // Reset the current talker emoji, just in case
      session.userData.current_talker_emoji = undefined;

      // Level variables
      session.userData.happyBarista = true;
      session.userData.sneakyPath = false;
      session.userData.infiltrationPath = false;
      session.userData.talkedAboutGDPR = false;
      session.sendTyping();
      setTimeout(() => {
        session.send(
          "As you enter the café you see your friend sitting at a table in the corner. You walk over and have a seat."
        );
        session.sendTyping();
        setTimeout(() => {
          session.beginDialog("friend", true);
        }, 3000);
      }, 4000);
    })

    .matches("talk to", (session, args) => {
      var baristaEntity = builder.EntityRecognizer.findEntity(args.entities, "barista");
      var tableEntity = builder.EntityRecognizer.findEntity(args.entities, "men at cafe table");
      var table2Entity = builder.EntityRecognizer.findEntity(args.entities, "table");
      var friendEntity = builder.EntityRecognizer.findEntity(args.entities, "friend");
      if (baristaEntity != null) {
        if (session.userData.happyBarista) {
          // Set happy barista as talker
          session.userData.current_talker_emoji = emojis.happyBarista;
          session.send('"Hi, what can I do for you?');
          session.sendTyping();
          setTimeout(() => {
            session.send(
              "\" Oh, you don't have any money? You should probably finish the coffee you already have then.." +
                emoji.get("face_with_rolling_eyes") +
                '"'
            );
          }, 3000);
        } else {
          // Set angry barista as talker
          session.userData.current_talker_emoji = emojis.angryBarista;
          session.send('"What do YOU want? Drink your coffee, and stop messing with the light!"');
        }
      } else if (tableEntity != null || table2Entity != null) {
        // Set two men as talkers
        session.userData.current_talker_emoji = emojis.man_1;
        if (session.userData.talkedAboutGDPR) {
          session.send("Hey, pal! Stop listening to our conversations and leave us alone!");
        } else {
          session.userData.talkedAboutGDPR = true;
          session.send(
            "Did you hear about Cambridge Analytica and how they influenced people by analyzing their facebook personal information?"
          );
          session.sendTyping();
          setTimeout(() => {
            session.userData.current_talker_emoji = emojis.man_2;
            session.send("No? What happened?");
            session.sendTyping();
            setTimeout(() => {
              session.userData.current_talker_emoji = emojis.man_1;
              session.send(
                "Facebook sold personal information about 50 million users to a company called Cambridge Analytica. They analyzed the data and created “psychological profiles” on the users. Political parties could then buy this information in order to show news articles to people which may want to vote for them. "
              );
              session.sendTyping();
              setTimeout(() => {
                session.userData.current_talker_emoji = emojis.man_2;
                session.send("That’s so scary. I am so deleting my facebook account!");
                session.sendTyping();
                setTimeout(() => {
                  session.userData.current_talker_emoji = emojis.man_1;
                  session.send("Hey! Are you listening to our conversation? That’s so rude, go somewhere else..");
                }, 3000);
              }, 10000);
            }, 3000);
          }, 5000);
        }
      } else if (friendEntity != null) {
        session.send("Your friend has left and you must find what he hid for you. Pay attention!");
      } else {
        var msg = new builder.Message(session)
          .text("Talk to whom?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "talk to barista", "Barista"),
              builder.CardAction.imBack(session, "talk to men at cafe table", "Two people at table"),
              builder.CardAction.imBack(session, "talk to friend", "Friend")
            ])
          );
        session.send(msg);
      }

      // Reset the talker
      setTimeout(() => {
        session.userData.current_talker_emoji = undefined;
      }, 4000);
    })

    .matches("use light switch", (session, args) => {
      session.userData.current_talker_emoji = undefined;
      session.send("The cafe goes dark");
      session.userData.happyBarista = false;

      session.sendTyping();
      setTimeout(() => {
        // Set angry barista as talker
        session.userData.current_talker_emoji = emojis.angryBarista;

        session.send(
          '"What\'s your problem dude?!? As the barista of this café I demand you turn it back on immediately"'
        );
      }, 3000);
      session.sendTyping();
      setTimeout(() => {
        session.userData.current_talker_emoji = undefined;
        session.send("You turn it back on...");
      }, 5000);
    })

    .matches("drink", (session, args) => {
      session.userData.current_talker_emoji = undefined;
      var drink_itemEntity = builder.EntityRecognizer.findEntity(args.entities, "drink_item");
      session.send("You drink the cup of coffee. Ew, you don't even like coffee. " + emoji.get("tired_face"));

      session.sendTyping();
      setTimeout(() => {
        if (session.userData.infiltrationPath) {
          session.send(
            "But what is this?" +
              emoji.get("astonished") +
              "\n\nThe phone number " +
              emojis.hiddenMessage +
              " was hidden inside the coffee cup!"
          );
          session.sendTyping();
          setTimeout(() => {
            session.send(
              "Your mission can begin!\n\nYou leave the café and head straight to city council to gain the trust of E.N.D Privacy."
            );
            session.sendTyping();
            setTimeout(() => {
              session.send(emoji.emojify(":running: :dash:"));
              session.sendTyping();
              setTimeout(() => {
                session.beginDialog("/level/5_1");
              }, 3000);
            }, 3000);
          }, 3000);
        } else {
          session.send(
            "But what is this?" +
              emoji.get("astonished") +
              "\n\nThe secret code " +
              emojis.hiddenMessage +
              " to the backdoor was hidden inside the coffee cup! "
          );
          session.send("Your mission can begin!\n\nYou leave the café and head straight to city council.");
          session.sendTyping();
          setTimeout(() => {
            session.send(emoji.emojify(":running: :dash:"));
            session.sendTyping();
            setTimeout(() => {
              session.beginDialog("/level/4_1");
            }, 3000);
          }, 3000);
        }
      }, 3000);
    })

    .matches("look under", (session, args) => {
      session.userData.current_talker_emoji = undefined;

      var drink_itemEntity = builder.EntityRecognizer.findEntity(args.entities, "drink_item");
      var tableEntity = builder.EntityRecognizer.findEntity(args.entities, "table");
      if (drink_itemEntity != null) session.send("You almost spilled your coffee and there was nothing underneath");
      else if (tableEntity != null) session.send("Nothing but your shoes under here..");
      else {
        var msg = new builder.Message(session)
          .text("Look under what?")
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.postBack(session, "look under coffee", "Coffee cup"),
              builder.CardAction.postBack(session, "look under table", "Table")
            ])
          );
        session.send(msg);
      }
    })
    .matches("look", (session, args) => {
      session.userData.current_talker_emoji = undefined;
      var drink_itemEntity = builder.EntityRecognizer.findEntity(args.entities, "drink_item");
      if (drink_itemEntity != null) session.send("The cup contains hot coffee");
      else {
        session.send("What a nice cafe" + emoji.get(""));
      }
    })

    .matches("pick up", (session, args) => {
      var drink_itemEntity = builder.EntityRecognizer.findEntity(args.entities, "drink_item");
      if (drink_itemEntity != null) {
        session.message.text = "look under coffee";
        level_3.replyReceived(session);
      } else {
        var notUnderstoodResponse = new builder.Message(session)
          .text(
            `I'm sorry ${session.message.user.name}. Im just a stupid bot...${emoji.get(
              "worried"
            )} I didn't quite understand. \n\nHere's some of the stuff you can do in this cafe` + emoji.get("ok_hand")
          )
          .suggestedActions(
            builder.SuggestedActions.create(session, [
              builder.CardAction.imBack(session, "Talk to barista", emojis.happyBarista + " Talk to barista"),
              builder.CardAction.imBack(
                session,
                "talk to men at cafe table",
                emojis.man_1 + emojis.man_2 + " Talk to men at table"
              ),
              builder.CardAction.imBack(session, "Drink coffee", emojis.coffe + " Drink coffee"),
              builder.CardAction.imBack(session, "turn light off", emojis.light_switch + " Switch off light")
            ])
          );
        session.send(notUnderstoodResponse);
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
              )} I didn't quite understand. \n\nHere's some of the stuff you can do in this cafe` + emoji.get("ok_hand")
            )
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "Talk to barista", emojis.happyBarista + " Talk to barista"),
                builder.CardAction.imBack(
                  session,
                  "talk to men at cafe table",
                  emojis.man_1 + emojis.man_2 + " Talk to men at table"
                ),
                builder.CardAction.imBack(session, "Drink coffee", emojis.coffe + " Drink coffee"),
                builder.CardAction.imBack(session, "turn light off", emojis.light_switch + " Switch off light")
              ])
            );
          session.send(notUnderstoodResponse);
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);
  bot.dialog("friend", [
    (session, args) => {
      // Set current talker to friend
      session.userData.current_talker_emoji = emojis.friend;

      if (!args) {
        session.send("Please don't interrupt me " + emoji.get("slightly_smiling_face"));
        session.sendTyping();
      } else {
        session.send('"Here, have a cup of coffee"\n\n Your friend slides a cup across the table' + emojis.coffe);
        session.sendTyping();
        setTimeout(() => {
          session.send(
            "As you may know, E.N.D Privacy are the new rulers of Metropolis. I work as a security guard at the city council, and I believe that they are violation the privacy of their citizens."
          );
          session.sendTyping();
          setTimeout(() => {
            session.send("It is rumoured that they listen to microphones in children’s toys!" + emoji.get("anguished"));
            session.sendTyping();
            setTimeout(() => {
              builder.Prompts.choice(
                session,
                "I have a plan to stop their illegal activities, but I need your help. Can I trust you?",
                "Yes|No",
                { listStyle: 3 }
              );
            }, 3000);
          }, 4000);
        }, 5000);
      }
    },
    (session, results) => {
      if (results.response) {
        switch (results.response.entity) {
          case "Yes":
            session.send("I knew I could trust you!");
            break;
          case "No":
            session.send("I'm gonna have to trust you..");
            break;
        }
      }
      session.sendTyping();
      setTimeout(() => {
        session.send(
          "The plan is to destroy the servers where all the precious data is stored " +
            emoji.get("minidisc") +
            " I have two plans for how to do this:"
        );
        session.sendTyping();
        setTimeout(() => {
          session.send(
            "\n\n1) Sneak your way in to the server room to destroy it, without being discovered.\n\n2) Infiltrate the E.N.D Privacy party by interviewing for a job and win their trust. Then destroy the data."
          );
          session.sendTyping();
          setTimeout(() => {
            builder.Prompts.choice(session, "Which plan do you choose?", "Sneaky|Infiltration", { listStyle: 3 });
          }, 3000);
        }, 3000);
      }, 3000);
    },
    (session, results) => {
      if (results.response) {
        // Resets the current talker
        session.userData.current_talker_emoji = emojis.friend;

        var hiddenMessage;

        switch (results.response.entity) {
          case "Infiltration":
            hiddenMessage =
              "Perfect! There are eyes everywhere, so I have hidden a phone number " +
              emojis.hiddenMessage +
              " for you to get an interview.";
            session.userData.infiltrationPath = true;
            break;

          case "Sneaky":
            hiddenMessage =
              "Perfect! There are eyes everywhere, so I have hidden the code " +
              emojis.hiddenMessage +
              " to the back door to the city hall";
            session.userData.sneakyPath = true;
            break;
        }
        session.send(hiddenMessage);
        session.sendTyping();
        setTimeout(() => {
          session.send("It is hidden somewhere in the cafe. Good luck!" + emoji.get("four_leaf_clover"));
          session.sendTyping();
          setTimeout(() => {
            session.userData.current_talker_emoji = undefined;

            session.sendTyping();
            setTimeout(() => {
              session.send("Your friend stands up and exits the cafe");

              session.send(backToMainLevelPhrase);
              session.endDialog();
            }, 3000);
          }, 3000);
        }, 3000);
      }
    }
  ]);

  return level_3;
};
