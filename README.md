# Lunchinator

[![CircleCI](https://circleci.com/gh/madetech/lunchinator.svg?style=svg)](https://circleci.com/gh/madetech/lunchinator)

An app to select people to go for lunch.

### Installation for Development
You will need `docker` and `docker-compose` installed. 

### Development

To setup the project make shure you have `docker` and `docker-compose` installed. Then run:
```bash
make setup
```
To get a shell where you can run the app and or tests you can call:
```bash
make shell
```
To only run the tests you can run
```bash
make spec
```

### Using Slack App in Development

We use `ngrok` to route traffic from the internet to our machine. See guide: https://api.slack.com/tutorials/tunneling-with-ngrok

### Guide to use the Lunchinator App

To use the app, there are a list of commands which need to be run on the lunchinator app by the admin.

- A `LunchCycle` refers to a cycle of approximately 6 weeks (this may increase or decrease depending on number of MT employees). A LunchCycle has the capacity to allow each staff member to join a friday lunch at least once. Each week of the lunch cycle contains the restaurant selected, the lunchers who have been drawn, and the date.

- A LunchCycle should be created a week before the previous LunchCycle ends. To do this, run the command `/lunchinator_new`. This will show you a preview message which will be sent out to all slack users.

- If you would like to alter the selection of restaurants previewed, see sheet: https://docs.google.com/spreadsheets/d/1uvAn-YIWggsbigWLVQJcukRxyR85rFYd0igJLvrHXes/edit#gid=0

- Rerun the command to create a new LunchCycle if the retsurant list has been altered.

- Once you are happy with the preview message, send the messages to all slack users using the `/lunchinator_availabilities` command. The slack users should respond with their availabilities.

- Slack users will have a week to respond to the message. You can send reminders to people who are yet to submit their reactions using the `/lunchinator_send_reminder` command.

- Once you are satisfied with the number responses, run the `/lunchinator_draw` command. This will select lunchers according to their availability.

- The draw can be amended here: https://mt-lunchinator.herokuapp.com/. The password can be found in 1password.

- Run the `/lunchinator_send_confirmation` command to individually message the selected lunchers. This message will output the restaurant, date and lunchers who will be attending with them.
