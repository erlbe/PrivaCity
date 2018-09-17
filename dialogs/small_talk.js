var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../globals/globals");
var storage = require("../storage/storage");

module.exports = function(LUISrecognizer) {
  var small_talk = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session, args) => {
      // Reset the current talker emoji, just in case
      session.userData.current_talker_emoji = undefined;

      var callstack = session.sessionState.callstack;
      var level = undefined;

      // Find the last level visited before smalltalk
      for (var i = callstack.length - 1; i >= 0; --i) {
        var dialog = callstack[i].id;
        if (dialog.includes("level")) {
          level = dialog;
          break;
        }
      }

      // Save missed utterance to storage
      storage.saveUtterance(session.userData.gameSessionID, level, session.message.text);

      // Invoke the matches with what the player said.
      small_talk.replyReceived(session);
    })
    .matches("Smalltalk.No", (session) => {
      session.endDialog("Ok, no problem " + emoji.get("slightly_smiling_face"));
    })
    .matches("Smalltalk.Yes", (session) => {
      session.endDialog("Yep! I agree " + emoji.get("thumbsup"));
    })
    .matches("Smalltalk.Greeting", (session) => {
      session.endDialog(
        `Hey you! ${emoji.get(
          "blush"
        )} Remember that you can say things like "Open the door" or "Take the elevator" to progress the game!`
      );
    })
    .matches("Smalltalk.Go fuck yourself", (session) => {
      session.endDialog("No. You can go fuck yourself!");
    })
    .matches("Smalltalk.Thank You", (session) => {
      session.endDialog("No problem, friend! " + emoji.get("blush"));
    })
    .matches("Smalltalk.Haha", (session) => {
      session.endDialog("Hahaha! Yeah I'm so funny " + emoji.get("joy"));
    })
    .matches("Smalltalk.Ok", (session) => {
      session.endDialog("Okidoki! " + emoji.get("thumbsup"));
    })

    .onDefault((session) => {
      // Did not match with any of the small talk matches. Go back to parent dialog, and say that you didn't understand.
      session.endDialogWithResult({ response: false });
    });
  return small_talk;
};
