var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");
var eavesdrop = require("../../globals/eavesdrop");

var emojis = {
  interviewer: emoji.get("older_woman"),
  headphones: emoji.get("headphones")
};
var recordings = eavesdrop.recordings;
module.exports = function(LUISrecognizer, bot) {
  // Eavesdrop level
  var level_5_2 = [
    (session) => {
      session.userData.current_talker_emoji = undefined;
      session.userData.levelsVisited.level_5_2 = true;
      session.send("A woman asks you to have a seat.");
      session.sendTyping();
      setTimeout(() => {
        session.userData.current_talker_emoji = emojis.interviewer;
        session.send(
          "Your first task as an employee is to listen to some audio recordings. With new personal assistants from Amazon and Google, and children's toys connected to the internet, we can listen to everything being said in people's homes!"
        );
      }, 2000);

      session.sendTyping();
      session.sendTyping();
      setTimeout(() => {
        builder.Prompts.choice(
          session,
          "Please classify the recordings as either:\n\n• Critical to the state \n\n• Can be used for blackmail \n\n• Not Interesting \n\nAre you ready to invade som privacy, " +
            session.userData.fname +
            "?",
          "Yes|No",
          { listStyle: 3 }
        );
      }, 5000);
    },
    (session, args) => {
      if (args.response) {
        if (args.response.entity == "Yes") {
          session.send("Very well, I'll leave you to it.");
          session.sendTyping();
          setTimeout(() => {
            session.userData.current_talker_emoji = undefined;
            session.send("You put on the headphones and start listening");

            session.sendTyping();
            setTimeout(() => {
              session.userData.current_talker_emoji = emoji.headphones;
              session.beginDialog("/eavesdrop");
            }, 2000);
          }, 2000);
        } else {
          session.send("I see, I wonder how you passed the interview. Please leave the building.");
          session.sendTyping();
          setTimeout(() => {
            session.userData.current_talker_emoji = undefined;
            session.send("Oh no, you failed the infiltration mission!");
            session.sendTyping();
            setTimeout(() => {
              session.send(
                "But what is this?  On your way out you find a room that must lead to the server. You must sneak in and finish what you started to not let your friend and the city down."
              );
              setTimeout(() => {
                session.beginDialog("/level/4_2");
              }, 2000);
            }, 3000);
          }, 6000);
        }
      }
    }
  ];
  bot.dialog("/eavesdrop", [
    function(session, args) {
      // Save previous state (create on first call)
      session.dialogData.index = args ? args.index : 0;
      session.dialogData.score = args ? args.form : 0;

      var index = session.dialogData.index;
      var recording = recordings[index].recording;
      session.sendTyping();
      setTimeout(() => {
        session.userData.current_talker_emoji = emojis.headphones;
        builder.Prompts.choice(session, recordings[index].recording, "Critical to state|Blackmail|Not interesting", {
          listStyle: 3
        });
      }, 4000);
    },
    function(session, results) {
      var answer = results.response.entity;
      session.userData.current_talker_emoji = emojis.interviewer;

      // If answered correctly
      if (answer == recordings[session.dialogData.index].correct) {
        session.sendTyping();
        setTimeout(() => {
          builder.Prompts.choice(
            session,
            emoji.get("white_check_mark") + " " + recordings[session.dialogData.index].explanation_correct,
            ["Next recording"],
            { listStyle: builder.ListStyle.button }
          );
        }, 3000);
      } else {
        // Incorrect
        // Save classifications to use in summary (if not already in the list)
        globals.addToArrayIfNotThere(
          session.userData.statistics.wrongClassifications,
          recordings[session.dialogData.index].recording
        );

        session.sendTyping();
        setTimeout(() => {
          builder.Prompts.choice(
            session,
            emoji.get("x") + " " + recordings[session.dialogData.index].explanation_wrong,
            ["Next recording"],
            {
              listStyle: builder.ListStyle.button
            }
          );
        }, 3000);
      }
    },
    (session, results) => {
      session.dialogData.index++;
      // Check for end of questions
      if (session.dialogData.index >= recordings.length) {
        // Quiz is done
        session.userData.current_talker_emoji = emojis.interviewer;
        session.send(`There are no more recordings to evaluate${emoji.get("cry")}\n\n`);
        session.sendTyping();
        setTimeout(() => {
          session.send("Hey, do you want to see where all this beautiful data is stored? Just enter that door.");
          session.sendTyping();
          setTimeout(() => {
            session.beginDialog("/level/6");
          }, 2000);
        }, 4000);
      } else {
        // Next question
        session.replaceDialog("/eavesdrop", session.dialogData);
      }
    }
  ]);

  return level_5_2;
};
