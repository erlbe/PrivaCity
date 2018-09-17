var azure = require("azure-storage");

var generateStatistics = () => {
  return process.env.GENERATE_STATISTICS == "true";
};

// Azure Storage Connection
var tableSvc = azure.createTableService(
  "privacygamestorage",
  "G3M4VyzYWj5nc4ILEELIwwciSNdhO8EGYCqsJ/jvGwTW8Qii80dxexDmuTyzt6NH6k2W+7zgtWgVKrcygAR4Ug=="
);
var entGen = azure.TableUtilities.entityGenerator;

var insertEntityAutoIncrement = (tablename, partitionKey, entity) => {
  var query = new azure.TableQuery().where("PartitionKey eq ?", partitionKey);

  tableSvc.queryEntities(tablename, query, null, function(error, result, response) {
    if (!error) {
      // Set length as ID (RowKey)
      entity.RowKey = entGen.String("" + getRowkey(result));

      tableSvc.insertEntity(tablename, entity, function(error, result, response) {
        if (!error) {
          // Entity inserted
        }
      });
    }
  });
};

var insertBatchEntitiesAutoIncrement = (tableName, partitionKey, questions, gameSessionID) => {
  var query = new azure.TableQuery().where("PartitionKey eq ?", partitionKey);
  tableSvc.queryEntities(tableName, query, null, function(error, result, response) {
    if (!error) {
      var tempRowKey = getRowkey(result);

      var batch = new azure.TableBatch();
      for (let index = 0; index < questions.length; index++) {
        const question = questions[index];
        tempRowKey += index;
        var questionEntity = {
          PartitionKey: entGen.String(partitionKey),
          RowKey: entGen.String("" + tempRowKey),
          gameID: entGen.String(gameSessionID),
          question: entGen.String(question)
        };
        batch.insertEntity(questionEntity);
      }
      if (batch.size() > 0) {
        tableSvc.executeBatch(tableName, batch, function(error, result, response) {
          if (!error) {
            // Batch completed
          }
        });
      }
    }
  });
};

var getRowkey = (result) => {
  var tempRowKey = -1;

  // Get length
  if (result.entries.length > 0) {
    result.entries.forEach((entity) => {
      // Find highest rowkey
      if (parseInt(entity.RowKey._) > tempRowKey) {
        tempRowKey = parseInt(entity.RowKey._);
      }
    });
  }
  tempRowKey++;
  return tempRowKey;
};

module.exports = {
  setUp: () => {
    var tables = ["statistics", "utterances", "wrongQuiz", "wrongClassifications"];

    tables.forEach((tableName) => {
      // Create table
      tableSvc.createTableIfNotExists(tableName, function(error, result, response) {
        if (!error) {
          // Table exists or created
        }
        if (result.created) {
          // Didn't exist
        }
      });
    });
  },

  saveUtterance: (gameSessionID, level, utterance) => {
    if (!generateStatistics()) {
      return;
    }
    var utterance = {
      PartitionKey: entGen.String("utterance"),
      RowKey: undefined, // Set later
      utterance: entGen.String(utterance),
      gameID: entGen.String(gameSessionID),
      level: entGen.String(level)
    };
    insertEntityAutoIncrement("utterances", "utterance", utterance);
  },

  saveStatistics: (gameSessionID, minutesSpent, secondsSpent, path) => {
    if (!generateStatistics()) {
      return;
    }
    var statistic = {
      PartitionKey: entGen.String("statistic"),
      RowKey: undefined, // Set later
      gameID: entGen.String(gameSessionID),
      minutesSpent: entGen.Int32(minutesSpent),
      secondsSpent: entGen.Int32(secondsSpent),
      path: entGen.String(path)
    };
    insertEntityAutoIncrement("statistics", "statistic", statistic);
  },

  saveWrongAnswers: (gameSessionID, wrongQuestions, wrongClassifications) => {
    if (!generateStatistics()) {
      return;
    }
    insertBatchEntitiesAutoIncrement("wrongQuiz", "quizQuestion", wrongQuestions, gameSessionID);
    insertBatchEntitiesAutoIncrement("wrongClassifications", "classification", wrongClassifications, gameSessionID);
  }
};
