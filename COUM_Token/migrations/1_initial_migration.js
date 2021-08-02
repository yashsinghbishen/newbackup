const Migrations = artifacts.require("Migrations");

// module.exports = function (deployer) {
//   deployer.deploy(Migrations,{
//     from: '0x895EEcC6efD2B491da62126076EaCBE688BE855F',
//     gas: 20000000
//   });
// };
module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
