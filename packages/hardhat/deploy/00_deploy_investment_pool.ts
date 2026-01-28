import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the InvestmentPool contract using the deployer account
 * Combined deployment script from InvestmentPool and YourContract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployInvestmentPool: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n📋 Desplegando el contrato InvestmentPool...");
  console.log("Address de Despliegue:", deployer);

  await deploy("InvestmentPool", {
    from: deployer,
    // Contract constructor arguments (none for InvestmentPool)
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const investmentPool = await hre.ethers.getContract<Contract>("InvestmentPool", deployer);
  console.log("✅ InvestmentPool desplegado en:", await investmentPool.getAddress());

  // Display initial state
  const poolBalance = await investmentPool.getPoolBalance();
  const minimumDeposit = await investmentPool.minimumDeposit();
  const greeting = await investmentPool.greeting();
  const totalDepositCounter = await investmentPool.totalDepositCounter();

  console.log("\n📊 Estado Inicial del Contrato:");
  console.log("Pool Balance:", hre.ethers.formatEther(poolBalance), "ETH");
  console.log("Depósito Mínimo:", hre.ethers.formatEther(minimumDeposit), "ETH");
  console.log("Administrador:", deployer);
  console.log("👋 Saludo inicial:", greeting);
  console.log("Total de Depósitos:", totalDepositCounter.toString());

  console.log("\n🎉 Despliegue completado satisfactoriamente!");
  console.log("📝 Próximos pasos:");
  console.log("   1. Corra 'yarn start' para interactuar con el Frontend");
  console.log("   2. Conecte su wallet");
  console.log("   3. Haga su primer depósito!");
  console.log("   4. Cree propuestas de inversión");
  console.log("   5. Vote y ejecute propuestas como administrador");
};

export default deployInvestmentPool;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags InvestmentPool
deployInvestmentPool.tags = ["InvestmentPool"];
