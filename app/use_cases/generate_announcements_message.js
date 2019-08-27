class GenerateAnnouncemntsMessage {
  execute({ lunchCycleWeek }) {
    const restaurant = lunchCycleWeek.restaurant.name;
    const lunchers = lunchCycleWeek.lunchers;

    const text = `Today, lunchers will be going to \*${restaurant}*. Here is a list of todays lunchers: ${this.buildLunchersList(
      lunchers
    )}`;

    return { text: text };
  }
  buildLunchersList(lunchers) {
    const lunchersList = [];
    lunchers.forEach(luncher => {
      lunchersList.push(`\n \<\@${luncher.slackUserId}\>`);
    });
    return "".concat(lunchersList);
  }
}
module.exports = GenerateAnnouncemntsMessage;
