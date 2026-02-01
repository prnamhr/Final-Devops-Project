/**
 * Abstract provider class for cloud instance providers
 */
class Provider {
  constructor(config) {
    if (this.constructor === Provider) {
      throw new Error("Cannot instantiate abstract Provider class directly");
    }
    this.config = config;
  }

  async listRegions() {
    throw new Error("Method 'listRegions()' must be implemented");
  }

  async listImages(region) {
    throw new Error("Method 'listImages()' must be implemented");
  }

  async listSizes(region) {
    throw new Error("Method 'listSizes()' must be implemented");
  }

  async create(options) {
    throw new Error("Method 'create()' must be implemented");
  }

  async getSSHInfo(instanceId, region) {
    throw new Error("Method 'getSSHInfo()' must be implemented");
  }

  async delete(instanceId, region) {
    throw new Error("Method 'delete()' must be implemented");
  }
}

module.exports = Provider; 