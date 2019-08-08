const { expect, sinon, config } = require("../test_helper");
const { FetchNonRespondersFromGoogleSheets } = require("@use_cases");

describe("FetchNonRespondersFromGoogleSheets", function() {
  it("fetches users who have no responded", async function() {
    const expected_response = [
      {
        first_name: "First Name",
        email: "Email",
        rest1: "Wagamamas - 16/08/2019",
        rest2: "Nandos - 23/08/2019",
        rest3: "Velo - 30/08/2019",
        rest4: "TheTable - 06/09/2019",
        rest5: "Tonkotsu - 13/09/2019",
        rest6: "UnionViet - 20/09/2019"
      },
      {
        first_name: "bob",
        email: "bob@bob.com",
        rest1: "x",
        rest2: "x",
        rest3: "x",
        rest4: "x",
        rest5: "x",
        rest6: "x"
      }
    ];

    const fakeSheetGateway = {
      fetchRows: () => [
        {
          first_name: "First Name",
          email: "Email",
          rest1: "Wagamamas - 16/08/2019",
          rest2: "Nandos - 23/08/2019",
          rest3: "Velo - 30/08/2019",
          rest4: "TheTable - 06/09/2019",
          rest5: "Tonkotsu - 13/09/2019",
          rest6: "UnionViet - 20/09/2019"
        },
        {
          first_name: "bob",
          email: "bob@bob.com",
          rest1: "x",
          rest2: "x",
          rest3: "x",
          rest4: "x",
          rest5: "x",
          rest6: "x"
        }
      ]
    };

    const dummySheetId = "dummy";

    sinon.stub(config, "AVA_LIST_SHEET_ID").get(() => dummySheetId);

    const useCase = new FetchNonRespondersFromGoogleSheets({
      googleSheetGateway: fakeSheetGateway
    });

    const response = await useCase.execute();

    expect(response).to.eql(expected_response);
  });
});
