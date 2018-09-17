# Hvordan å kjøre:

1.  Installer [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install) og lag en bruker.
2.  Logg inn på Heroku profilen din: `heroku login`
3.  ~~For å deploye (til Facebook Messenger): `git push heroku master`~~ For å deploye er det bare å pushe GitHub.
4.  For å logge i konsollen: `heroku logs --tail`
5.  Snakk med boten i [Facebook Messenger](https://www.messenger.com/t/618670278474259)

## Use Azure app service editor

1.  make code change in the online editor

Your code changes go live as the code changes are saved.

## Use Visual Studio Code

### Build and debug

1.  download source code zip and extract source in local folder
2.  open the source folder in Visual Studio Code
3.  make code changes
4.  download and run [botframework-emulator](https://emulator.botframework.com/)
5.  connect the emulator to http://localhost:3987

### Publish back

```
npm run azure-publish
```

## Use continuous integration

If you have setup continuous integration, then your bot will automatically deployed when new changes are pushed to the source repository.
