var https = require("https");

var url = {
  questionnaire_url_sneaky: "https://goo.gl/forms/ZcOOcfpgOxhVXSWi2",
  questionnaire_url_infiltrate: "https://goo.gl/forms/NCNHLWuYuNlL1Ml93",
  questionnaire_url_infiltrate1: "https://goo.gl/forms/VkuadzxGKMcPvgfq1",
  questionnaire_url_infiltrate2: "https://goo.gl/forms/4z73lG2w1zpYNp4z1",
  questionnaire_url_main: "https://goo.gl/forms/j3nNKuBMYntAPtZg2"
};

var generateID = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var Globals = {
  // City where the action is happening
  city: "Trondheim",

  // Name of café to meet in level 3
  cafe_name: "Café del Mar",

  // Name of friend who works in city council
  friend_name: `Erlend 'The Hulk' Berger`,

  quiz_reward: 100,

  // Password for door in level 4.2
  password_4_2: "privacy is business",

  number_of_quiz_questions: 5,

  time_limit: Number.MAX_SAFE_INTEGER,

  setUpStatistics: (session) => {
    // Set statistics variables
    session.userData.statistics = {
      startTime: Date.now(),
      wrongQuizQuestions: [],
      wrongClassifications: []
    };

    // Set levels visited variables
    var levelsVisited = {
      level_4_1: false,
      level_4_2: false,
      level_5_1: false,
      level_5_2: false
    };
    session.userData.levelsVisited = levelsVisited;

    // Set game ID
    session.userData.gameSessionID = generateID(1000, 9999);

    // Get profile pic
    var PSID = session.message.user.id;
    if (session.message.source == "facebook") {
      var pageAccessToken =
        "EAAE15tF305IBANVnM59dRPpjodnZCZB020lpPAJgZB2LN2SnKZC4PcirRLWj4rWXloWVxUT1doLCu2D3BepEDD7KBT4OpbNnerZCFg7HZAtQ7tkO5FbrR5EGLm4MGCzfZBYs8qZCl5aYSLbEmeeGbEDqqCpyO7wjXOXhCoKpPzbAxAZDZD";
      var url =
        "https://graph.facebook.com/v2.6/" +
        PSID +
        "?fields=first_name,last_name,profile_pic&access_token=" +
        pageAccessToken;

      https.get(url, (res) => {
        var body = "";

        res.on("data", function(chunk) {
          body += chunk;
        });

        res.on("end", function() {
          var jsonBody = JSON.parse(body);
          session.userData.profile_pic = jsonBody.profile_pic;
        });
      });
    }
  },

  getQuestionnaireURL: (levelsVisited) => {
    if (levelsVisited.level_4_1) {
      return url.questionnaire_url_sneaky;
    } else if (levelsVisited.level_5_1 && levelsVisited.level_5_2 && levelsVisited.level_4_2) {
      return url.questionnaire_url_infiltrate2;
    } else if (levelsVisited.level_5_1 && levelsVisited.level_4_2) {
      return url.questionnaire_url_infiltrate1;
    } else if (levelsVisited.level_5_1 && levelsVisited.level_5_2) {
      return url.questionnaire_url_infiltrate;
    } else {
      return url.questionnaire_url_main;
    }
  },

  addToArrayIfNotThere: (list, item) => {
    list.indexOf(item) === -1 ? list.push(item) : console.log("This item is already in the list");
  }
};

module.exports = Globals;
