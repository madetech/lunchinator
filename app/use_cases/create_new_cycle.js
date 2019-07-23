class CreateNewCycle {
  constructor(options) {
    this.gateway = options.gateway;
  }

  execute() {
    this.gateway.save();
  }
}

module.exports = CreateNewCycle;
