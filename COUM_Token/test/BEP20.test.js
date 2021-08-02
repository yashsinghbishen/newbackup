"use strict";

require("babel-core/register");
require("babel-polyfill");

const BN = require('bn.js')
const suite = require('./src/suite');
const BEP20Token = artifacts.require('BEP20Token');

contract('BEP20Token', function (accounts) {
	let options = {
		// accounts to test with, accounts[0] being the contract owner
		accounts: accounts,

		// factory method to create new token contract
		create: async function () {
			return await BEP20Token.new();
		},

		// factory callbacks to mint the tokens
		// use "transfer" instead of "mint" for non-mintable tokens
		transfer: async function (token, to, amount) {
			return await token.transfer(to, amount, { from: accounts[0] });
		},

		// optional:
		// also test the increaseApproval/decreaseApproval methods (not part of the ERC-20 standard)
		increasedecreaseAllowance: true,

		// token info to test
		name: 'Coumunitas',
		symbol: 'COUM',
		decimals: 18,

		// initial state to test
		initialSupply: new BN('1000000000000000000000000000'),
		initialBalances: [
			[accounts[0], new BN('1000000000000000000000000000')]
		],  
		initialAllowances: [
			[accounts[0], accounts[1], new BN('0')]
		]
	};

	suite(options);
});
