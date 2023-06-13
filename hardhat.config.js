require("@nomicfoundation/hardhat-toolbox");
require("./tasks/faucet");

module.exports = {
    solidity: "0.8.17",
    networks: {
        main: {
            chainId: 1337,
            url: "http://localhost:8545"
        },
        hardhat: {
            chainId: 1,
            forking: {
                url: "https://rpc.ankr.com/eth"
            },
            gas: 1800000
        }
    }
};
