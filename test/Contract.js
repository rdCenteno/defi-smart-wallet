const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract", function () {

    beforeEach(async () => {
        [owner, addr1] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("Contract");
        contract = await Contract.deploy(addr1.address);
        await contract.deployed();

        //signer = await ethers.getImpersonatedSigner(ADDRESS);
        //tokenContract = await ethers.getContractAt("IERC20", CONTRACT_ADDRESS);
    });

    describe("Test method", function () {

        it("Should check ", async function () {
        });
    });
});