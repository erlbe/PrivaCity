var builder = require("botbuilder");

module.exports = function(LUISrecognizer) {
  // Introduction to how the game is played.
  var intro = new builder.IntentDialog({ recognizers: [LUISrecognizer] })
    .onBegin((session) => {
      session.send(
        "We are about to enter the world of PrivaCity. In this game you will explore a world using text and buttons."
      );
      session.sendTyping();
      setTimeout(() => {
        session.send(
          'You will be presented with rooms containing several objects. These objects are interactable, and you can say things like "Open the door" or "Take the elevator" to progress the game.'
        );

        session.sendTyping();
        setTimeout(() => {
          var msg = new builder.Message(session).text(`Are you ready?`).addAttachment(
            new builder.HeroCard(session).buttons([
              builder.CardAction.dialogAction(session, "startLevel0Action", "arguments", "Ready!")
              //builder.CardAction.imBack(session, "No thanks", "No thanks")
            ])
          );
          session.send(msg);
        }, 5000);
      }, 4000);
    })

    .onDefault([
      (session) => {
        session.sendTyping();
        session.beginDialog("/small_talk");
      },
      (session, args) => {
        if (!args.response) {
          session.send("Sorry, I don't understand what you mean! Click the 'Ready!' button to start the game.");
        } else {
          // Do nothing. The small_talk dialog handled the response
        }
      }
    ]);

  return intro;
};
