require("module-alias/register");

const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const app = require("@root/index");

chai.use(chaiHttp);

describe("Index", function() {
  after(async function() {
    app.stop();
  });

  it("works", function() {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a("object");
      });
  });
});
