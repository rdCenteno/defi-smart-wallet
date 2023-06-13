const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract", function () {

    beforeEach(async () => {
        [owner, addr1] = await ethers.getSigners();

        const SmartWallet = await ethers.getContractFactory("SmartWallet");
        smartWallet = await SmartWallet.deploy(addr1.address);
        await smartWallet.deployed();
    });

    describe("Test method", function () {

        it("Should check ", async function () {
        });
    });
});