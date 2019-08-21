class GenerateSelectedLunchersMessage {
  execute({ lunchCycleWeek, luncher }) {
    const listOfLunchers = this.buildLunchersList({ lunchCycleWeek, luncher });
    const message = `Congratulations \<\@${luncher.slackUserId}\>, you have been selected to join the lunchers on \*${lunchCycleWeek.restaurant.date}\*!.\n You will be going to ${lunchCycleWeek.restaurant.name} along with:${listOfLunchers}`;

    return { text: message };
  }

  buildLunchersList({ lunchCycleWeek, luncher }) {
    const lunchersList = [];
    const lunchers = lunchCycleWeek.lunchers;
    const lunchersExcludingLuncher = lunchers.splice(lunchers.indexOf(luncher), 1); //filter didnt work here
    lunchersExcludingLuncher.forEach(luncher => {
      lunchersList.push(`\n \<\@${luncher.slackUserId}\>`);
    });
    return "".concat(lunchersList);
  }
}
module.exports = GenerateSelectedLunchersMessage;
