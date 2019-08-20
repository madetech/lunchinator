const config = require("@app/config");

class ExportLunchersDrawToGoogleSheet {
  constructor({ googleSheetGateway }) {
    this.googleSheetGateway = googleSheetGateway;
  }
  async execute({ lunchCycleWeeks }) {
    const doc = await this.googleSheetGateway.fetchDoc(config.LUNCH_CYCLE_WEEK_SHEET_ID);

    for (const lunchCycleWeek of lunchCycleWeeks) {
      const workSheetTitle = lunchCycleWeek.restaurant.date;
      const restaurantName = lunchCycleWeek.restaurant.name;
      const worksheet = await this.googleSheetGateway.addWorksheetTo({
        doc: doc,
        title: workSheetTitle,
        headers: ["Restaurant", "Name", "Email", "", "AlsoAvailable"]
      });

      await this.googleSheetGateway.addRow({
        sheet: worksheet,
        row: {
          restaurant: restaurantName
        }
      });

      for (const luncher of lunchCycleWeek.lunchers) {
        await this.googleSheetGateway.addRow({
          sheet: worksheet,
          row: {
            name: luncher.firstName,
            email: luncher.email,
            "": ""
          }
        });
      }

      for (const available of lunchCycleWeek.allAvailable) {
        await this.googleSheetGateway.addRow({
          sheet: worksheet,
          row: {
            alsoavailable: available.email
          }
        });
      }
    }
  }
}
module.exports = ExportLunchersDrawToGoogleSheet;
