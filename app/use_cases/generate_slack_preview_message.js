class GenerateSlackPreviewMessage {
  execute({ lunchCycle }) {
    let message =
      "Hey {first name}! It’s time to enter the draw for the next cycle of company lunches. Let us know which dates you’ll be available on by reacting with the matching emoji.\n\n";

    lunchCycle.restaurants.forEach((r, i) => {
      const nextDate = new Date(lunchCycle.starts_at.getTime() + i * 7 * 86400000);
      const dateString = `${nextDate.getDate()}/${nextDate.getMonth() +
        1}/${nextDate.getFullYear()}`;
      message += `${r.emoji} ${dateString} ${r.name} vegan:${r.dietaries.vegan}, meat:${r.dietaries.meat}, direction:${r.direction}\n`;
    });

    return {
      message: message
    };
  }
}

module.exports = GenerateSlackPreviewMessage;
