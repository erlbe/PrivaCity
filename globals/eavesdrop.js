// Critical to state | Blackmail | Not interesting
var emoji = require("node-emoji");

var q1 = {
  recording: "Hey, honey. Have you heard about how the new government are tracking us? They are criminals!!",
  correct: "Critical to state",
  explanation_correct: "Good call, this man sounds critical to our masterplan",
  explanation_wrong: "Are you sure, he sounded pretty critical to me.."
};

var q2 = {
  recording: "Look at this video, cats are so stupid!",
  correct: "Not interesting",
  explanation_correct: "Yeah, everything gets recorded, and there is a lot of casual talk.",
  explanation_wrong: "Not sure about that, everyone likes cat videos.."
};

var q3 = {
  recording: "Baby, my husband must never know what we are doing when he's at work" + emoji.get("kiss"),
  correct: "Blackmail",
  explanation_correct: "Haha, we can definitely use that against the cheating wife in the future",
  explanation_wrong: "Hmm, it sounded like she was having an affair. And that can be used for blackmailing."
};

var q4 = {
  recording: "I hate how the government are monitoring our every move! Hope someone can take them down.",
  correct: "Critical to state",
  explanation_correct: "I agree, we should keep an eye on this guy",
  explanation_wrong: "He seems critical to the state, and should be kept an eye on"
};

var q5 = {
  recording: "Oh, shit! Clamydia?!?! My girlfriend cannot find out.",
  correct: "Blackmail",
  explanation_correct: "Haha, should've used a condom" + emoji.get("joy"),
  explanation_wrong:
    "Haha, should've used a condom" + emoji.get("joy") + " But I think we could use that for blackmail."
};

var eavesdrop = {
  recordings: [q1, q2, q3, q4, q5]
};

module.exports = eavesdrop;
