const safeFromJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("safe json failure", e);
    return "";
  }
};


const getNetIdString = () => {
  return window.web3.eth.net.getId()
    .then((id) => {
      switch (id) {
        case 1:
          return 'Main Ethereum Network';
        case 3:
          return 'Ropsten Ethereum Test Network';
        case 4:
          return 'Rinkeby Ethereum Test Network';
        case 42:
          return 'Kovan Ethereum Test Network';
        case 'loading':
          return 'loading..';
        // Will be some random number when connected locally
        default:
          return 'Local Test Network';
      }
    });
};

const getEtherscanAddress = () => {
  return window.web3.eth.net.getId()
    .then((id) => {
      switch (id) {
        case 1:
          return 'http://etherscan.io';
        case 3:
          return 'http://ropsten.etherscan.io';
        case 4:
          return 'http://rinkeby.etherscan.io';
        case 42:
          return 'http://kovan.etherscan.io';
        default:
          throw new Error(`Unknown network ID ${id}`);
      }
    })
    .then((etherScanAddress) => {
      console.log(`Setting etherscan address as ${etherScanAddress}`);
      return etherScanAddress;
    });
};

module.exports = {
  safeFromJson,
  getEtherscanAddress,
  getNetIdString
};
