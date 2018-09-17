var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");

var emojis = {
  interviewer: emoji.get("older_man")
};

var maxNumberOfFails = 2;

module.exports = function(LUISrecognizer, bot) {
  // Interview level
  var level_5_1 = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      // Reset the current talker emoji, just in case
      session.userData.current_talker_emoji = undefined;
      session.userData.levelsVisited.level_5_1 = true;
      session.sendTyping();
      setTimeout(() => {
        session.send(
          `You are now in the headquarters of the city council, ready to infiltrate the E.N.D. Privacy Party`
        );
      }, 3000);
      session.sendTyping();
      setTimeout(() => {
        session.send(`A man in his early 60s approaches you ` + emojis.interviewer);

        //TODO: La spilleren få se på avisen en gang til? Og gå gjennom hva han snakket med vennen om.

        session.sendTyping();
        setTimeout(() => {
          var msg = new builder.Message(session)
            .text(emojis.interviewer + `: "Are you ready to begin the interview, ${session.message.user.name}?"`)
            .addAttachment(
              new builder.HeroCard(session).buttons([
                builder.CardAction.dialogAction(session, "startInterviewAction", (startInterview = true), "Begin!")
              ])
            );
          session.send(msg);
        }, 5000);
      }, 5000);
    })

    .onDefault([
      (session) => {
        session.sendTyping();
        session.beginDialog("/small_talk");
      },
      (session, args) => {
        if (!args.response) {
          session.send(`I'm sorry. I don't understand` + emoji.get("confused"));
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  bot.dialog("/interview", [
    (session, args) => {
      session.userData.interviewFails = 0;
      if (!args) {
        // The interview wasn't started from begin button.
        session.endDialog(`"Ok, whenever you're ready press the button."`);
      } else {
        // Set the emoji for the person talking
        session.userData.current_talker_emoji = emojis.interviewer;

        session.send(
          `"Welcome, ${
            session.message.user.name
          }. As you are aware, this is an interview for the position 'Data Usage Expert'. I will therefore ask you some questions where you answer to the best of your knowledge."`
        );
        session.sendTyping();
        session.sendTyping();
        setTimeout(() => {
          builder.Prompts.text(session, `"We begin simple. Please describe yourself in 3 words."`);
        }, 8000);
      }
    },
    (session, args, next) => {
      var response = args.response;
      var words = response.split(" ");
      if (words.length == 3) {
        session.send(`"${response}? A most impressive answer!"`);
      } else {
        session.userData.interviewFails++;
        session.send(
          `"${response}? That's not three words. I'm not sure you're right for this position... \n\nNonetheless, we will proceed!"`
        );
      }
      session.sendTyping();
      session.sendTyping();
      setTimeout(() => {
        session.send(
          `"Alright, enough about you. As you know, we are looking for someone who has ideas for how to use the information collected from the Smart City. The former rulers only used it to improve city efficency and never violated the privacy of the citizens. We don't care about that, we want to use the information for what it's worth!"`
        );
        session.sendTyping();
        setTimeout(() => {
          builder.Prompts.confirm(session, `Are you the right person to do this?`, {
            listStyle: builder.ListStyle.button
          });
        }, 3000);
      }, 8000);
    },
    (session, args, next) => {
      if (args.response) {
        session.send(`"Perfect! I knew your friend would recommend a good candidate."`);
      } else {
        session.userData.interviewFails++;
        session.send(
          `"No? Well, your friend recommended you for this position. I like him, so I will give you the benefit of the doubt."`
        );
      }
      if (session.userData.interviewFails >= maxNumberOfFails) {
        throw_out(session);
      } else {
        session.sendTyping();
        setTimeout(() => {
          var msg = new builder.Message(session)
            .text(
              `"Say for instance that we have hidden microphones on all street corners. \n\nHow could we use this information?"`
            )
            .suggestedActions(
              builder.SuggestedActions.create(session, [
                builder.CardAction.imBack(session, "Don't know", "Don't know"),
                builder.CardAction.imBack(session, "Identify rebels", "Identify rebels"),
                builder.CardAction.imBack(session, "Find bad parents", "Find bad parents"),
                builder.CardAction.imBack(session, "Targeted ads", "Targeted ads"),
                builder.CardAction.imBack(session, "Sell to Cambridge Analytica", "Sell to Cambridge Analytica")
              ])
            );
          builder.Prompts.text(session, msg);
        }, 6000);
      }
    },
    (session, args, next) => {
      var response = args.response;
      if (response != "Don't know") {
        session.send(`"Wow, that's a good idea! ${response}? I would have never thought of that"`);
      } else {
        session.userData.interviewFails++;
        session.send(`"You don't know? As a Data Usage Expert I would expect you to think of something."`);
      }

      if (session.userData.interviewFails >= maxNumberOfFails) {
        throw_out(session);
      } else {
        session.sendTyping();
        setTimeout(() => {
          builder.Prompts.confirm(session, `"And say; should we inform the citizens that we have these microphones?"`, {
            listStyle: builder.ListStyle.button
          });
        }, 5000);
      }
    },
    (session, args, next) => {
      if (!args.response) {
        session.send(
          `"Muahahaha ${emoji.get(
            "joy"
          )} I agree!! I like the way you think, mister. We actually have a saying in my country: 'What you don't know, you don't have pain from'"`
        );
      } else {
        session.userData.interviewFails++;
        session.send(`"You think we should tell them? I doubt they will reveal as much..."`);
      }

      if (session.userData.interviewFails >= maxNumberOfFails) {
        throw_out(session);
      } else {
        session.sendTyping();
        setTimeout(() => {
          session.send(
            builder.Prompts.choice(
              session,
              `"You're doing great so far! I have one last question for you. \n\n As you may have read in the newspaper ${emoji.get(
                "newspaper"
              )}, the crime rates have decreased since we installed surveillance cameras on all streets. Do you remember by how much it dropped?"`,
              ["10%", "25%", "50%", "100%"],
              {
                listStyle: builder.ListStyle.button
              }
            )
          );
        }, 5000);
      }
    },
    (session, args, next) => {
      var response = args.response.entity;
      if (response == "50%") {
        session.send(`"Correct! I bet we could use those cameras for other things as well"` + emoji.get("wink"));
      } else {
        session.userData.interviewFails++;
        session.send(
          `Wrong! The crime rate dropped by 50% actually. I bet we could use those cameras for other things as well"` +
            emoji.get("wink")
        );
      }
      if (session.userData.interviewFails >= maxNumberOfFails) {
        throw_out(session);
      } else {
        session.sendTyping();
        setTimeout(() => {
          next();
        }, 6000);
      }
    },
    (session, args, next) => {
      session.send(`"Thank you for taking the time to interview for this position. I think you are a perfect fit!"`);

      session.sendTyping();
      setTimeout(() => {
        var msg = new builder.Message(session)
          .text(
            `"We actually have a task for you right away. We are gathering so much information, and we need to classify it somehow. Can you help us?"`
          )
          .addAttachment(
            new builder.HeroCard(session).buttons([
              builder.CardAction.dialogAction(session, "startLevel5_2Action", "arguments", "Of course!")
            ])
          );
        session.send(msg);
      }, 6000);
    },
    (session, args) => {
      //TODO Make this work. I.e if the player says "no" when asked to proceed to next level
    }
  ]);

  return level_5_1;
};

var throw_out = (session) => {
  session.send(`"I have had enough of your nonsense! You are not the right person for this job. Please leave"`);
  session.sendTyping();
  setTimeout(() => {
    session.userData.current_talker_emoji = undefined;
    session.send("Oh no, you failed the interview!");
    session.sendTyping();
    setTimeout(() => {
      session.send(
        "But what is this? On your way out you find a room that must lead to the server. You must sneak in and finish what you started to not let your friend and the city down!"
      );
      session.sendTyping();
      setTimeout(() => {
        session.beginDialog("/level/4_2");
      }, 2000);
    }, 3000);
  }, 5000);
};
