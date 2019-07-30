const config = require("@app/config");
const crypto = require("crypto");
const qs = require("qs");

class VerifySlackRequest {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute(request) {
    const slackSignature = request.slackSignature;
    const timestamp = request.timestamp;
    const body = qs.stringify(request.body, { format: "RFC1738" });

    if (!this.requestIsRecent(timestamp)) {
      return this.falseResponse("Invalid timestamp.");
    }

    const mySignature = this.generateSignature(timestamp, body);

    if (this.gateway.areSignaturesEqual(mySignature, slackSignature)) {
      return { isVerified: true };
    }

    return this.falseResponse("Signature mismatch.");
  }

  requestIsRecent(timestamp) {
    if (!timestamp) {
      return false;
    }

    // convert current time from milliseconds to seconds
    const currentTime = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(currentTime - timestamp) > 120) {
      return false; // if request is less than 2mins old
    }

    return true;
  }

  generateSignature(timestamp, body) {
    const basestring = "v0:" + timestamp + ":" + body;
    const secret = config.SLACK_SIGNING_SECRET;

    return `v0=${crypto
      .createHmac("sha256", secret)
      .update(basestring, "utf8")
      .digest("hex")}`;
  }

  falseResponse(err) {
    return {
      isVerified: false,
      error: err
    };
  }
}

module.exports = VerifySlackRequest;
