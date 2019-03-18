//const dieselPrice = artifacts.require('./DieselPrice.sol');
const flightTest =  artifacts.require('./FlightTest.sol');
const usingOraclize =  artifacts.require('./usingOraclize.sol');
const strings = artifacts.require('./stringutils/strings.sol');
const dateTime = artifacts.require('./library/DateTime.sol');
const shareHolder = artifacts.require('./Shareholder.sol');
/*module.exports = deployer =>
  contracts.map(contract => 
      deployer.deploy(contract))
*/




async function doDeploy(deployer, network) {
    await deployer.deploy(strings);
    await deployer.deploy(dateTime);
    await deployer.link(strings, flightTest);
    await deployer.link(dateTime, flightTest);
    await deployer.deploy(usingOraclize);
    let flightTestContract = await deployer.deploy(flightTest,{gas: 6721975});
    console.log(flightTestContract.address);
    let holderContract = await deployer.deploy(shareHolder,flightTestContract.address);
    console.log(flightTestContract.address);
    await flightTestContract.setHolderContract(holderContract.address);
}


module.exports = (deployer, network) => {
    deployer.then(async () => {
        await doDeploy(deployer);
    });
};