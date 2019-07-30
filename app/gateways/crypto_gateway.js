const crypto = require("crypto");

class CryptoGateway {
  areSignaturesEqual(mySignature, theirSignature) {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(mySignature, "utf8"),
        Buffer.from(theirSignature, "utf8")
      );
    } catch (err) {
      console.log("ERR:" + err);
      return false;
    }
  }
}
module.exports = CryptoGateway;
