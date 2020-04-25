//const dieselPrice = artifacts.require('./DieselPrice.sol');
const flightInsurance =  artifacts.require('./FlightInsurance.sol');
const usingOraclize =  artifacts.require('./usingOraclize.sol');
const strings = artifacts.require('./stringutils/strings.sol');
const dateTime = artifacts.require('./library/DateTime.sol');
const shareHolder = artifacts.require('./Shareholder.sol');
const safeMath = artifacts.require('./library/SafeMath.sol');
/*module.exports = deployer =>
  contracts.map(contract => 
      deployer.deploy(contract))
*/




async function doDeploy(deployer, network) {
    await deployer.deploy(strings);
    await deployer.deploy(dateTime);
    await deployer.deploy(safeMath);
    await deployer.link(strings, flightInsurance);
    await deployer.link(dateTime, flightInsurance);
    await deployer.deploy(usingOraclize);
    let flightTestContract = await deployer.deploy(flightInsurance,{gas: 6721975});
    await deployer.link(safeMath, shareHolder);
    let holderContract = await deployer.deploy(shareHolder,flightTestContract.address);
    await flightTestContract.setHolderContract(holderContract.address);
}


module.exports = (deployer, network) => {
    deployer.then(async () => {
        await doDeploy(deployer);
    });
};