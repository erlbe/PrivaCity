var q1 = {
  statement: "Listen to all conversations through microphones hidden in children toys.",
  violation: true,
  explanation:
    'This is a violation of user privacy. The doll "Cayla" was actually removed from market as its recordings could be easily hacked.  '
};

var q2 = {
  statement: "Inrease traffic flow by monitoring which roads are most used",
  violation: false,
  explanation:
    "As long as the data is anonymized, this isn't a privacy violation, and is one of many ways which smart cities can be used to improve efficency."
};

var q3 = {
  statement: "Using location data from smart phones to determine people's location at all time.",
  violation: true,
  explanation:
    "Location data from people should not be used to monitor single individuals, but rather in anonymized collections of data."
};

var q4 = {
  statement: "Smart street lights that adjusts to natural lighting and people nearby.",
  violation: false,
  explanation:
    "Barcelona actually has a smart lighting system doing exactly that, and more, saving the city as much as 40% in lighting costs."
};

var privacy_classification = {
  statements: [q1, q2, q3, q4]
};

module.exports = privacy_classification;
