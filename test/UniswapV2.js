const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { constant } = require("./helpers/constant");
const { UNISWAP_ROUTER, ETH_TO_MAKER, MAKER, MAKER_WHALE, MAKER_TO_ETH } = constant;


describe("Smart Wallet, Uniswap", () => {

    beforeEach("Deploy SmartWallet contract", async () => {
        [owner, addr1, addr2] = await ethers.getSigners();

        const UniswapWallet = await ethers.getContractFactory("UniswapWallet");
        smartWallet = await UniswapWallet.deploy(UNISWAP_ROUTER);
        await smartWallet.deployed();

        makerWhale = await ethers.getImpersonatedSigner(MAKER_WHALE);

        routerContract = await ethers.getContractAt("IRouter", UNISWAP_ROUTER);
    });

    describe("Swap Eth", () => {

        it("Should swap eth for token (swapExactETHForTokens)", async() => {
            const amountIn = ethers.utils.parseEther("1.0");
            const deadline = Math.ceil((new Date().valueOf() / 1000)) + 1200; //Date.now + 20 minutes

            const tokenContract = await ethers.getContractAt("IERC20", MAKER);

            expect(await tokenContract.balanceOf(smartWallet.address)).to.equal(0);
            
            const optimalAmounts = await routerContract.getAmountsOut(1000000, ETH_TO_MAKER);
           
            const swapTx = await smartWallet.connect(owner).swapExactETHForTokens(
                optimalAmounts[optimalAmounts.length - 1], ETH_TO_MAKER, deadline, { value: 1000000 }
            );
            const swapReceipt = await swapTx.wait();
            const swapEvent = swapReceipt.events.filter(event => event.event == "SwapETHForTokens");
            const finalAmountOut = swapEvent[0].args.amountOut;

            const currentBalance = await tokenContract.balanceOf(smartWallet.address);
            expect(currentBalance).to.equal(finalAmountOut);
            expect(currentBalance).to.equal(optimalAmounts[optimalAmounts.length - 1]);
        });

        it("Should withdraw the tokens amount", async() => {
            const amountIn = ethers.utils.parseEther("1.0");
            const deadline = Math.ceil((new Date().valueOf() / 1000)) + 1200; //Date.now + 20 minutes
            const tokenContract = await ethers.getContractAt("IERC20", MAKER);

            const ownerInitialBalance = await tokenContract.balanceOf(owner.address);
            
            const optimalAmounts = await routerContract.getAmountsOut(amountIn, ETH_TO_MAKER);

            const swapTx = await smartWallet.connect(owner).swapExactETHForTokens(
                optimalAmounts[optimalAmounts.length - 1], ETH_TO_MAKER, deadline, { value: amountIn }
            );

            const swapReceipt = await swapTx.wait();
            const swapEvent = swapReceipt.events.filter(event => event.event == "SwapETHForTokens");
            expect(swapEvent[0].args.from).to.equal(owner.address);
            expect(swapEvent[0].args.amountOut).to.equal(optimalAmounts[optimalAmounts.length - 1]);
            

            const currentBalance = await tokenContract.balanceOf(smartWallet.address);
            expect(currentBalance).to.equal(optimalAmounts[optimalAmounts.length - 1]);

            const withdrawTx = await smartWallet.connect(owner).withdrawToken(MAKER, currentBalance);
            const withdrawReceipt = await withdrawTx.wait();
            const withdrawEvent = withdrawReceipt.events.filter(event => event.event == "WithdrawToken");
            expect(withdrawEvent[0].args.token).to.equal(MAKER);
            expect(withdrawEvent[0].args.amount).to.equal(currentBalance);
            expect(withdrawEvent[0].args.owner).to.equal(owner.address);

            expect(await tokenContract.balanceOf(smartWallet.address)).to.equal(0);
            
            const finalOwnerBalance = (await tokenContract.balanceOf(owner.address));
            expect(finalOwnerBalance).to.equal(currentBalance.add(ownerInitialBalance));
        });
    });

    describe("Swap Token", () => {

        it("Should swap tokens for ETH (swapExactTokensForETH)", async() => {
            const amountIn = ethers.utils.parseEther("1.0");
            const deadline = Math.ceil((new Date().valueOf() / 1000)) + 1200; //Date.now + 20 minutes
            const tokenContract = await ethers.getContractAt("IERC20", MAKER);

            await tokenContract.connect(makerWhale).approve(makerWhale.address, amountIn);
            await tokenContract.connect(makerWhale).transfer(owner.address, amountIn);
            //expect(await tokenContract.balanceOf(owner.address)).to.equal(amountIn);
            
            const optimalAmounts = await routerContract.getAmountsOut(amountIn, MAKER_TO_ETH);
            await tokenContract.connect(owner).approve(smartWallet.address, amountIn);
            /* await expect(
                smartWallet.connect(owner).swapExactTokensForETH(amountIn, optimalAmounts[optimalAmounts.length - 1], MAKER_TO_ETH, deadline)
            ).to.emit(smartWallet, "SwapTokensForETH")
            .withArgs(owner.address, smartWallet.address, amountIn, anyValue); */

            const swapTx = await smartWallet.connect(owner).swapExactTokensForETH(amountIn, optimalAmounts[optimalAmounts.length - 1], MAKER_TO_ETH, deadline);
            const swapReceipt = await swapTx.wait();

            const events = swapReceipt.events.filter(event => event.event == "SwapTokensForETH");
            const swapEvent = events[0];
            expect(swapEvent.args.from).to.equal(owner.address);
            expect(swapEvent.args.to).to.equal(smartWallet.address);
            expect(swapEvent.args.amountIn).to.equal(amountIn);

            const finalAmountOut = swapEvent.args.amountOut;

            const currentBalance = await ethers.provider.getBalance(smartWallet.address); 
            expect(currentBalance).to.equal(finalAmountOut);
            expect(currentBalance).to.equal(optimalAmounts[optimalAmounts.length - 1]);
        });

        it("Should withdraw the tokens amount", async() => {
            const amountIn = ethers.utils.parseEther("1.0");
            const deadline = Math.ceil((new Date().valueOf() / 1000)) + 1200; //Date.now + 20 minutes
            const tokenContract = await ethers.getContractAt("IERC20", MAKER);

            await tokenContract.connect(makerWhale).approve(makerWhale.address, amountIn);
            await tokenContract.connect(makerWhale).transfer(owner.address, amountIn);

            const optimalAmounts = await routerContract.getAmountsOut(amountIn, MAKER_TO_ETH);
            await tokenContract.connect(owner).approve(smartWallet.address, amountIn);

            await expect(
                smartWallet.connect(owner).swapExactTokensForETH(amountIn, optimalAmounts[optimalAmounts.length - 1], MAKER_TO_ETH, deadline)
            ).to.emit(smartWallet, "SwapTokensForETH")
            .withArgs(owner.address, smartWallet.address, amountIn, optimalAmounts[optimalAmounts.length - 1]);

            const currentBalance = await ethers.provider.getBalance(smartWallet.address); 
            expect(currentBalance).to.equal(optimalAmounts[optimalAmounts.length - 1]);

            await expect(
                smartWallet.connect(owner).withdraw(currentBalance)   
            ).to.emit(smartWallet, "Withdraw")
            .withArgs(currentBalance, owner.address)

            expect(await ethers.provider.getBalance(smartWallet.address)).to.equal(0);
            expect(await tokenContract.balanceOf(smartWallet.address)).to.equal(0);
        });
    });
});
