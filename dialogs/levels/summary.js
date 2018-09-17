var builder = require("botbuilder");
var emoji = require("node-emoji");
var globals = require("../../globals/globals");
var Jimp = require("jimp");
var fs = require("fs");
var util = require("util");
var storage = require("../../storage/storage");

module.exports = function(LUISrecognizer, bot) {
  // Introduction to how the game is played.
  var intro = new builder.IntentDialog({ recognizers: [LUISrecognizer] }).onBegin((session, args) => {
    // Time spent
    var secondsSpent = (Date.now() - session.userData.statistics.startTime) / 1000;
    var minutes = Math.floor(secondsSpent / 60);

    //Original bilde
    var fileName = "globals/fonts/game_summary.png";
    var minutesCaption = minutes + ":" + ("0" + Math.round(secondsSpent - minutes * 60)).slice(-2);
    var idCaption = session.userData.gameSessionID.toString();
    var loadedImage;
    Jimp.read(fileName, function(err, image) {
      Jimp.loadFont("globals/fonts/font_72.fnt", function(err, font) {
        image.print(font, 450, 255, minutesCaption);
        image.print(font, 455, 450, idCaption);
        image.write("globals/fonts/newImage.png", function(err, image) {
          fs.readFile("globals/fonts/newImage.png", function(err, data) {
            var contentType = "image/png";
            var base64 = Buffer.from(data).toString("base64");
            var msg = new builder.Message(session).addAttachment({
              contentUrl: util.format("data:%s;base64,%s", contentType, base64),
              contentType: contentType
            });
            session.send(msg);
            // Game reflection
            setTimeout(() => {
              if (args) {
                if (args.data == "destroyed") {
                  session.send(
                    "You destroyed the server. The city is now an ordinary (boring) city " + emoji.get("cityscape")
                  );
                } else {
                  session.send(
                    "You didn't destroy the server. You now have to live under the terrible rule of the E.N.D. Privacy party. But it may be worth it. That's up to you " +
                      emoji.get("blush")
                  );
                }
              }
              //Wrong quiz questions
              var questionsString;

              // No incorrect quiz
              if (session.userData.statistics.wrongQuizQuestions.length == 0) {
                questionsString =
                  "You answered all the quiz questions in the hotel lobby correctly! Good job " + emoji.get("thumbsup");
              } else {
                // Some incorrect
                questionsString = "You answered the following quiz-o-mat questions wrong:";
                for (let index = 0; index < session.userData.statistics.wrongQuizQuestions.length; index++) {
                  const question = session.userData.statistics.wrongQuizQuestions[index];
                  questionsString += "\n\n• " + question;
                }
              }

              var classificationString;

              if (session.userData.statistics.wrongClassifications.length == 0) {
                classificationString =
                  "You managed to classify all the privacy statements correctly! Good job " + emoji.get("thumbsup");
              } else {
                classificationString = "You classified the following statements wrong:";
                for (let index = 0; index < session.userData.statistics.wrongClassifications.length; index++) {
                  const classification = session.userData.statistics.wrongClassifications[index];
                  classificationString += "\n\n• " + classification;
                }
              }

              // Figure out which path player chose
              var path;
              if (session.userData.infiltrationPath) {
                path = "infiltration";
              } else if (session.userData.sneakyPath) {
                path = "sneaky";
              } else {
                path = undefined;
              }

              // Save statistics to storage
              storage.saveStatistics(session.userData.gameSessionID, minutes, secondsSpent, path);

              // Save wrong quiz questions
              storage.saveWrongAnswers(
                session.userData.gameSessionID,
                session.userData.statistics.wrongQuizQuestions,
                session.userData.statistics.wrongClassifications
              );

              session.sendTyping();
              // Send statistics

              setTimeout(() => {
                session.send(questionsString);
                session.send(classificationString);
                // Restart game prompt
                session.sendTyping();
                setTimeout(() => {
                  // var msg = new builder.Message(session)
                  //   .text("Play again?")
                  //   .suggestedActions(
                  //     builder.SuggestedActions.create(session, [
                  //       builder.CardAction.postBack(session, "level_0", "Restart Game")
                  //     ])
                  //   );
                  // session.send(msg);

                  session.send(
                    `Thank you for playing the game.\n\nYour ID is: ${idCaption} \n\nPlease answer the following questionnaire: ` +
                      globals.getQuestionnaireURL(session.userData.levelsVisited)
                  );
                }, 3000);
              }, 4000);
            }, 5000);
          });
        });
      });
    }).catch(function(err) {
      console.error(err);
    });
  });
  return intro;
};
