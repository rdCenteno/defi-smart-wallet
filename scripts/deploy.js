async function main() {
  // ethers is available in the global scope
  [deployer, addr1] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory("Contract");
  const contract = await Contract.deploy(addr1.address);
  await contract.deployed();

  console.log("Wallet address:", contract.address);
  console.log("Wallet owner:", addr1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
