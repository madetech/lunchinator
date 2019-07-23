const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const app = require("../index");

chai.use(chaiHttp);

describe("Index", function() {
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
