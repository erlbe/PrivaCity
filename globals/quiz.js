var q1 = {
  question: "Can Snapchat sell your pictures?",
  image: "",
  choices: ["Yes", "No"],
  correct: "Yes",
  explanation:
    "Actually, according to the Snapchat privacy declaration, they can sell content to third parties without any responsibility for how the data is used.\n\nThat is scary! ",
  explanationUrl: "https://www.snap.com/nb-NO/privacy/privacy-policy/"
};

var q2 = {
  question: "How is information collected in a Smart City?",
  image: "",
  choices: ["Spies", "A Questionnaire", "Digital Sensors", "Trained Birds"],
  correct: "Digital Sensors",
  explanation:
    "A smart city is an urban area that uses different types of digital data collection sensors to supply information which is used to manage the city efficiently."
};

var q3 = {
  question: "Does facebook know which other web pages you visit?",
  image: "",
  choices: ["Yes, always", "With a share button", "No, never", "That is illegal"],
  correct: "With a share button",
  explanation:
    "If a web page contains a 'Like' or 'Share' button, Facebook can use cookies to know that you have visited the page, and maybe share that information with others."
};

var q4 = {
  question: "Can Facebook sell your information to other companies?",
  image: "",
  choices: ["Yes", "No"],
  correct: "Yes",
  explanation:
    "When you created a Facebook profile, you have agreed to Facebook’s privacy statement which says that the personal information collected may be shared with other companies. Unless you explicitly has told them not to.",
  explanationUrl: "https://www.theguardian.com/news/series/cambridge-analytica-files"
};

var q5 = {
  question: "Can the data collected in a Smart City be abused?",
  image: "",
  choices: ["Yes", "No"],
  correct: "Yes",
  explanation:
    "The information collected in a smart city can be used to create a safer, cleaner, more sustainable and efficient city. However, this same information can also be abused to violate the privacy of its citizens."
};

var q6 = {
  question: "Does all mobile applications have access to your position?",
  image: "",
  choices: ["Yes", "No, need permission"],
  correct: "Yes",
  explanation:
    "TTo access your position, the application needs your explicit permission. This is a trade-off which the user has to make. Will allowing the application access to your location provide an improved service? How can the application abuse this personal information?"
};

var Quiz = {
  questions: [q1, q2, q3, q4, q5]
};

module.exports = Quiz;
