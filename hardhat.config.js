require("@nomicfoundation/hardhat-toolbox");
require("./tasks/faucet");

module.exports = {
    solidity: "0.8.17",
    networks: {
        hardhat: {
            chainId: 1337,
            forking: {
                url: "https://rpc.ankr.com/eth"
            },
            gas: 1800000
        }
    }
};
