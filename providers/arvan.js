const endpoint = 'https://napi.arvancloud.ir/ecc/v1';
require('dotenv').config();
const { array } = require('yargs');
const Provider = require('./provider');

class ArvanProvider extends Provider {
  constructor(config = { token, }) {
    super(config);
  }

  async listRegions() {
    try {
      const response = await fetch(`${endpoint}/regions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get regions: ${response.status} ${response.statusText}`);
      }

      return (await response.json()).data;
    }
    catch (error) {
      console.log('Failed to get regions', error.message);
      throw error;
    }
  }

  async listImages(region) {
    try {
      const response = await fetch(`${endpoint}/regions/${region}/images/marketplace`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get images: ${response.status} ${response.statusText}`);
      }

      return (await response.json()).data;
    }
    catch (error) {
      console.log('Failed to get images', error.message);
      throw error;
    }
  }

  async listSizes(region) {
    try {
      const response = await fetch(`${endpoint}/regions/${region}/sizes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get List Sizes: ${response.status} ${response.statusText}`);
      }

      return (await response.json()).data;
    }
    catch (error) {
      console.log('Failed to get List Sizes', error.message);
      throw error;
    }
  }

  async create(options) {
    const { name, region, size, image } = options;

    try {
      const sshKeys = await this.getSSHKeys(region);
      const response = await fetch(`${endpoint}/regions/${region}/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        },
        body: JSON.stringify({
          name,
          flavor_id: size,
          image_id: image,
          enable_ipv4: true,
          enable_ipv6: false,
          disk_size: 25,
          key_name: sshKeys[0] // First SSH key in the list
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create server: ${response.status} ${response.statusText}`);
      }

      // TODO 7: Wait for server to be ready, then get its IP and print it
      const data = await response.json();
      const serverId = data.data.id;
      let retries = 20;
      let ip = null;
      let status = null;

      while (retries-- > 0) {
        await new Promise(res => setTimeout(res, 5000));
        const res = await fetch(`${endpoint}/regions/${region}/servers/${serverId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Apikey ${this.config.token}`,
          }
        });

        if (!res.ok) break;

        const data = await res.json();
        status = data.status || (data.data && data.data.status);
        const addresses = data.addresses || (data.data && data.data.addresses);

        if (addresses) {
          for (const key in addresses) {
            const arr = addresses[key];
            if (Array.isArray(arr)) {
              for (const addrObj of arr) {
                if (addrObj && typeof addrObj === 'object' && addrObj.addr) {
                  ip = addrObj.addr;
                  break;
                }
              }
            }
            if (ip) break;
          }
        }

        if (status === 'ACTIVE' && ip) break;
      }

      // Attach firewall to server
      const isFirewallAttached = await this.attachFireWallToServer(region, serverId);
      if (isFirewallAttached){
        console.log("Firewall successfuly attached to server")
      } else {
        console.log("Failed to attach firewall to server")
      }
      return { id: serverId, name, status, ip };
    } catch (error) {
      console.error('Failed to create server:', error.message);
      throw error;
    }
  }

  async getSSHKeys(region) {
    try {
      const response = await fetch(`${endpoint}/regions/${region}/ssh-keys`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to get SSH Keys: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.data.map(key => key.name);
    } catch (error) {
      console.error('Failed to get SSH Keys:', error.message);
      throw error;
    }
  }

  async delete(serverName, region) {
    try {
      const res = await fetch(`${endpoint}/regions/${region}/servers`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to list servers: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const servers = data.data || [];
      const server = servers.find(server => server.name === serverName);

      if (!server) {
        throw new Error(`Server "${serverName}" was not found in "${region}".`);
      }

      const serverId = server.id;

      // Force delete the server
      const deleteResponse = await fetch(`${endpoint}/regions/${region}/servers/${serverId}?forceDelete=true`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        },
        body: JSON.stringify({ reasons: [] }),
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete server: ${deleteResponse.status} ${deleteResponse.statusText}`);
      }

      return true;

    } catch (error) {
      console.error('Failed to delete server:', error.message);
      throw error;
    }
  }

  async listInstances(region) {
    try {
      const res = await fetch(`${endpoint}/regions/${region}/servers`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to list servers: ${res.status} ${res.statusText}`);
      }

      const servers = await res.json();
      return (servers.data || []).map(server => {
        // Public IP
        let ip = '-';
        if (server.addresses) {
          for (const key in server.addresses) {
            const arr = server.addresses[key];
            if (Array.isArray(arr)) {
              for (const addrObj of arr) {
                if (addrObj && typeof addrObj === 'object' && addrObj.addr) {
                  ip = addrObj.addr;
                  break;
                }
              }
            }
            if (ip !== '-') break;
          }
        }

        return {
          id: server.id,
          name: server.name,
          status: server.status,
          ip
        };
      });

    } catch (error) {
      console.error('Failed to list servers:', error.message);
      return [];
    }
  }

  async listSecurityGroups(region) {
    try {
      const res = await fetch(`${endpoint}/regions/${region}/securities`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to list servers: ${res.status} ${res.statusText}`);
      }

      return (await res.json()).data;

    } catch (error) {
      console.error('Failed to list servers:', error.message);
      return [];
    }
  }

  async getDefaultSecurityGroup(region) {
    try {
      const firewalls = await this.listSecurityGroups(region);
      const defaultFirewall = firewalls.find(firewall => firewall.name.toLowerCase() === 'default');

      if (defaultFirewall) {
        console.log('ID of default firewall:', defaultFirewall.id);
        return defaultFirewall.id
      } else {
        console.log('Default firewall not found');
      }
      return null

    } catch (error) {
      console.error('Failed to list servers:', error.message);
      return null;
    }

  }

  async attachFireWallToServer(region, serverId) {
    try {
      const securityGroupId = await this.getDefaultSecurityGroup(region);
      const res = await fetch(`${endpoint}/regions/${region}/servers/${serverId}/add-security-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.config.token}`,
        },
        body: JSON.stringify({
          security_group_id: securityGroupId
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to attach firewall: ${res.status} ${res.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
      }

      const status_code = res.status;
      return status_code === 202;

    } catch (error) {
      console.error('Failed to attach firewall:', error.message);
      return null;
    }
  }
}



module.exports = ArvanProvider; 