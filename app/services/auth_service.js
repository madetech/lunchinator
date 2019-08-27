const { CryptoGateway } = require("@gateways");
const { VerifySlackRequest, IsLunchinatorAdmin } = require("@use_cases");
const config = require("@app/config");

class AuthService {
  constructor() {
    this.verifySlackRequest = new VerifySlackRequest({ gateway: new CryptoGateway() });
    this.isLunchinatorAdmin = new IsLunchinatorAdmin();
  }

  isAdmin(userId) {
    var isLunchinatorAdminResponse = this.isLunchinatorAdmin.execute({ userId: userId });
    return isLunchinatorAdminResponse.isValid;
  }

  verifyRequest(headers, body) {
    const response = this.verifySlackRequest.execute({
      slackSignature: headers["x-slack-signature"],
      timestamp: headers["x-slack-request-timestamp"],
      body: body
    });

    return response.isVerified;
  }

  getToken(req) {
    if (!req.headers.authorization || req.headers.authorization.indexOf("Basic ") === -1) {
      return;
    }

    // verify auth credentials
    const base64Password = req.headers.authorization.split(" ")[1];
    const password = Buffer.from(base64Password, "base64").toString("ascii");

    if (password !== config.VUE_APP_PASSWORD) {
      return;
    }

    return base64Password;
  }
}

module.exports = AuthService;
