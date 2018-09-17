var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");
var quiz = require("../../globals/quiz");

var emojis = {
  blogger: emoji.get("nail_care"),
  receptionist: emoji.get("information_desk_person"),
  quizomat: emoji.get("atm")
};

var backToMainLevelPhrase = `You are back in the hotel lobby. You can see the receptionist ${
  emojis.receptionist
}, the "quiz-o-mat" ${emojis.quizomat} and the blogger ${emojis.blogger}`;

module.exports = function(LUISrecognizer, bot) {
  // Hotel lobby
  var level_2 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      // Reset the current talker emoji, just in case
      session.userData.current_talker_emoji = undefined;

      session.userData.money = 0;
      if (session.userData.isSharingLocation) {
        session.userData.money += 50;
      }

      session.send("Another message! " + emoji.get("iphone"));
      var msg = new builder.Message(session).attachments([
        {
          contentType: "image/png",

          // // For mobile:
          // contentUrl: "https://i.imgur.com/JmQy3P8.png"

          // For PC:
          contentUrl: "https://i.imgur.com/0heuYmd.png"
        }
      ]);
      session.send(msg);
      session.sendTyping();
      setTimeout(() => {
        session.send(
          `As you exit the elevator you find yourself in the hotel lobby. You can see a receptionist ${
            emojis.receptionist
          }, a "quiz-o-mat" ${emojis.quizomat} and a blogger ${emojis.blogger}`
        );
      }, 10000);
    })

    .matches("talk to", [
      (session, args) => {
        var receptionistEntity = builder.EntityRecognizer.findEntity(args.entities, "receptionist");
        var bloggerEntity = builder.EntityRecognizer.findEntity(args.entities, "blogger");

        if (receptionistEntity != null) {
          session.beginDialog("/receptionist");
        } else if (bloggerEntity != null) {
          session.beginDialog("/blogger");
        } else {
          var msg = new builder.Message(session)
            .text("Who do you want to talk to?")
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "Talk to receptionist", emojis.receptionist + " Receptionist"),
                builder.CardAction.imBack(session, "Talk to blogger", emojis.blogger + "Blogger")
              ])
            );
          session.send(msg);
        }
      },
      (session, args) => {
        // Do nothing
        // Reset the emoji to undefined when ending the dialog
        session.userData.current_talker_emoji = undefined;
      }
    ])
    .matches("order taxi", (session, args) => {
      var msg = new builder.Message(session)
        .text(`You don't know the number to the taxi company. Maybe there is someone here who can help you?`)
        .suggestedActions(
          builder.SuggestedActions.create(session, [
            builder.CardAction.imBack(session, "Talk to receptionist", emojis.receptionist + " Receptionist"),
            builder.CardAction.imBack(session, "Talk to blogger", emojis.blogger + "Blogger")
          ])
        );
      session.send(msg);
    })

    .matches("play quiz", [
      (session, args) => {
        var text = `Welcome to the quiz-o-mat! Are you ready to put your knowledge to use and earn some much needed stone cold ca$h? ${emoji.get(
          "moneybag"
        ) + emoji.get("moneybag")}?`;
        builder.Prompts.choice(session, text, ["Play Quiz!", "Nah..."], { listStyle: builder.ListStyle.button });
      },
      (session, results) => {
        if (results.response) {
          var response = results.response.entity;
          if (response == "Play Quiz!") {
            session.beginDialog("/quiz");
          } else {
            session.send("Alright, buddy. Maybe another time! " + emoji.get("blush"));
          }
        }
      },
      (session, args) => {
        // Do nothing
      }
    ])

    .onDefault([
      (session) => {
        session.sendTyping();
        session.beginDialog("/small_talk");
      },
      (session, args) => {
        if (!args.response) {
          var notUnderstoodResponse = `Sorry! I didn't understand... Maybe you want to talk to somebody in the hotel lobby?`;
          session.send(notUnderstoodResponse);
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  bot.dialog("/receptionist", [
    (session, args) => {
      if (!args) {
        // No arguments, then the player have approached the receptionist.
        session.conversationData.questions = ["Order Taxi", "Change Rooms", "Dinner Reservation", "Nothing"];
        session.send(`You approach the receptionist`);
        session.sendTyping();
        setTimeout(() => {
          session.userData.current_talker_emoji = emojis.receptionist;
          builder.Prompts.choice(session, `"Good day, what may I help you with?"`, session.conversationData.questions, {
            listStyle: builder.ListStyle.button
          });
        }, 3000);
      } else {
        session.userData.current_talker_emoji = emojis.receptionist;

        // The dialog is repeated. Remove the last question asked by the user.
        var previousQuestionAsked;
        if (args.data) {
          previousQuestionAsked = args.data;
        } else {
          previousQuestionAsked = args;
        }

        var index = session.conversationData.questions.indexOf(previousQuestionAsked);
        if (index > -1) {
          session.conversationData.questions.splice(index, 1);
        }
        session.sendTyping();
        setTimeout(() => {
          builder.Prompts.choice(session, `"Anything else I may help you with?"`, session.conversationData.questions, {
            listStyle: builder.ListStyle.button
          });
        }, 3000);
      }
    },
    (session, results) => {
      // TODO: Implement logic for choosing 5 questions.
      // TODO: Implement logic for rewarding money if correctly answered
      if (results.response) {
        var response = results.response.entity;

        if (response == "Change Rooms") {
          session.send(`"I am terribly sorry. We are fully booked, so your room can't be changed. #sorrynotsorry"`);
        }
        if (response == "Dinner Reservation") {
          session.send(
            `"We don't serve food here, I'm afraid. I've heard the food at ${globals.cafe_name} is excellent."`
          );
        }

        if (response == "Order Taxi") {
          var totalAmountMoneyNeeded = 100;

          if (session.userData.isSharingLocation) {
            totalAmountMoneyNeeded += 50;
          }
          if (session.userData.money < totalAmountMoneyNeeded) {
            session.send(
              `"Sorry buddy, you need ${totalAmountMoneyNeeded}kr to take the taxi to ${
                globals.cafe_name
              }. You only have ${session.userData.money}kr"`
            );
            var msg = new builder.Message(session)
              .text(`"I got an idea! You can win money on the quiz-o-mat! "` + emoji.get("grin"))
              .addAttachment(
                new builder.HeroCard(session).buttons([
                  builder.CardAction.dialogAction(
                    session,
                    "startQuizAction",
                    null,
                    emojis.quizomat + " Play quiz-o-mat"
                  ),
                  builder.CardAction.dialogAction(session, "startReceptionistAction", "Order Taxi", "No thanks!")
                ])
              );
            session.sendTyping();
            setTimeout(() => {
              session.send(msg);

              setTimeout(() => {
                session.endDialog("");
              }, 500);
            }, 5000);
          } else {
            session.send(
              `"So you want to go to ${globals.cafe_name}? That will cost you ${totalAmountMoneyNeeded}! "` +
                emoji.get("dollar")
            );

            session.sendTyping();
            setTimeout(() => {
              session.send(
                `"Perfect! You have that exact amount of money. The taxi is just outside, ready to take you to ${
                  globals.cafe_name
                }"`
              );

              session.sendTyping();
              setTimeout(() => {
                session.userData.current_talker_emoji = undefined;
                session.send(emoji.emojify(":taxi: :dash:"));
                session.beginDialog("/level/3");
              }, 5000);
            }, 3000);
          }
        } else if (response == "Nothing") {
          session.send(`"Alright, let me know if there is anything else you need, darling "` + emoji.get("kiss"));
          session.sendTyping();
          setTimeout(() => {
            session.userData.current_talker_emoji = undefined;
            session.endDialog(backToMainLevelPhrase);
          }, 4000);
        } else {
          // Do the dialog again, and send the response to remove it from the list of questions.
          session.replaceDialog("/receptionist", response);
        }
      } else {
        session.send(`"Ok! Have a nice day."`);

        session.sendTyping();
        setTimeout(() => {
          session.userData.current_talker_emoji = undefined;
          session.endDialog(backToMainLevelPhrase);
        }, 4000);
      }
    }
  ]);

  bot.dialog("/blogger", (session, args) => {
    // Set the emoji for the person talking
    session.userData.current_talker_emoji = emojis.blogger;

    session.send(
      `"I used to be a famous blogger, but then I accidentally shared some naked pictures ${emoji.get(
        "bikini"
      )} Now I'm a SUPER famous blogger! ${emoji.get("star")}"`
    );
    session.sendTyping();
    setTimeout(() => {
      session.send(
        `"But why am I talking to you? Running a fashion blog is hard work. Mind your own business, nerd ${emoji.get(
          "nerd_face"
        )}"`
      );
    }, 5000);
    session.sendTyping();
    setTimeout(() => {
      session.endDialog(backToMainLevelPhrase);
    }, 10000);
  });

  bot.dialog("/quiz", [
    (session, args, next) => {
      session.userData.current_talker_emoji = undefined;
      if (!args || args.action == "startQuizAction") {
        // First question. Give intro to the quiz.
        session.send(
          `Alright, the rules are simple: I will ask you ${
            globals.number_of_quiz_questions
          } questions about privacy, and if you're able to answer more than 50% correct, you will get ${
            globals.quiz_reward
          }kr! ${emoji.get("dollar")}`
        );
      }
      // Go to question step, and send along the args
      next(args);
    },
    (session, args) => {
      // Save previous state (create on first call)
      session.dialogData.index = args.index ? args.index : 0;

      // Score during the quiz
      session.dialogData.score = args.score ? args.score : 0;

      // Prompt user for next question
      // TODO: add image etc...
      var index = session.dialogData.index;
      var question = quiz.questions[index].question;
      var choices = quiz.questions[index].choices;
      builder.Prompts.choice(session, `Q${index + 1}: ` + question, choices, { listStyle: builder.ListStyle.button });
    },
    (session, results) => {
      var response = results.response.entity;
      var correctResponse = quiz.questions[session.dialogData.index].correct;

      if (response == correctResponse) {
        session.dialogData.score++;
        session.send(
          `${emoji.get("white_check_mark")} Correct! \n\nYou have ${session.dialogData.score} correct answers so far.`
        );
      } else {
        // Wrong answer
        session.send(`${emoji.get("x")} Incorrect! \n\nYou have ${session.dialogData.score} correct answers so far.`);
        // Save question to use in summary (if not already in the list)
        globals.addToArrayIfNotThere(
          session.userData.statistics.wrongQuizQuestions,
          quiz.questions[session.dialogData.index].question
        );
      }

      // Provide explanation
      session.sendTyping();
      setTimeout(() => {
        builder.Prompts.choice(session, quiz.questions[session.dialogData.index].explanation, ["Next Question"], {
          listStyle: builder.ListStyle.button
        });
      }, 3000);
    },
    (session, results) => {
      session.dialogData.index++;
      // Check for end of questions
      if (session.dialogData.index >= quiz.questions.length) {
        // Quiz is done
        session.send(
          `That was all the questions! Your final score is ` +
            session.dialogData.score +
            " out of " +
            globals.number_of_quiz_questions
        );
        if (session.dialogData.score > globals.number_of_quiz_questions / 2) {
          session.userData.money += globals.quiz_reward;
          session.send(
            "Congratulations! You answered enough answers correctly. \n\nYou receive " +
              globals.quiz_reward +
              "kr " +
              emoji.get("dollar")
          );
          session.sendTyping();
          setTimeout(() => {
            session.endDialog(backToMainLevelPhrase);
          }, 4000);
        } else {
          var msg = new builder.Message(session)
            .text(
              "I'm sorry! You need more than 50% correct to receive the money reward. However you can always play again!"
            )
            .addAttachment(
              new builder.HeroCard(session).buttons([
                builder.CardAction.dialogAction(
                  session,
                  "startQuizAction",
                  "arguments",
                  emojis.quizomat + " Play quiz-o-mat"
                ),
                builder.CardAction.imBack(session, "No thanks!", "No thanks!")
              ])
            );
          session.send(msg);
          session.endDialog();
        }
      } else {
        // Next question
        session.replaceDialog("/quiz", session.dialogData);
      }
    }
  ]);

  return level_2;
};
