const BEP20Token = artifacts.require("BEP20Token");

// module.exports = function (deployer) {
//   deployer.deploy(BEP20Token,{
//     from: '0x895EEcC6efD2B491da62126076EaCBE688BE855F',
//     gas: 20000000
//   });
// };

module.exports = function (deployer) {
  deployer.deploy(BEP20Token);
};
