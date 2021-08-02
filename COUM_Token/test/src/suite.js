'use strict'

import { expectRevertOrFail, bn } from './helpers'

const expect = require('chai')
	.use(require('chai-bn')(web3.utils.BN))
	.expect

/**
 * The test suite configuration.
 * @typedef {Object} SuiteOptions
 * @property {string[]} accounts
 *   The unlocked accounts to test with (starting at index 1). At least 4 accounts are required.
 *   Contract owner is expected to be accounts[0].
 * @property {TokenCreateCallback} create
 *   Callback to create token contract with.
 * @property {TokenTransferOrMintCallback} [transfer]
 *   Callback to transfer tokens with. Tokens must not be transferred from the account of index 1 or higher.
 * @property {TokenTransferOrMintCallback} [mint]
 *   Callback to mint tokens with.
 * @property {BN|number} [initialSupply]
 *   The initial token supply. Defaults to 0.
 * @property {[string, BN|number][]} initialBalances
 *   The tuples (account, balance) of initial account balances. Defaults to [] (no initial balance testing).
 * @property {[string, string, BN|number][]} initialAllowances
 *   The tuples (owner, spender, allowance) of initial allowances. Defaults to [] (no initial allowance testing).
 * @property {string} [name]
 *   The expected token name (if not provided, name is not tested).
 * @property {string} [symbol]
 *   The expected token symbol (if not provided, symbol is not tested).
 * @property {string} [decimals]
 *   The expected token number decimals (if not provided, decimals are not tested).
 * @property {boolean} [increasedecreaseAllowance]
 *   Controls whether increase and decrease approval functions should be tested (they are not part of the ERC-20).
 * @property {TokenCallback} [beforeEach]
 *   Callback to be called on every beforeEach.
 * @property {TokenCallback} [afterEach]
 *   Callback to be called on every afterEach.
 */

/**
 * The token creation callback.
 * @callback TokenCreateCallback
 * @returns {Object} The deployed token contract.
 */

/**
 * @callback TokenCallback
 * @param {Object} token The deployed token contract.
 */

/**
 * The token purchase callback.
 * @callback TokenTransferOrMintCallback
 * @param {Object} token The token created by TokenCreateCallback to transfer tokens of.
 * @param {string} to Account of the beneficiary.
 * @param {BN|number} amount The amount of the tokens to purchase.
 */

/**
 * Function will test the given contract to fullfil ERC-20 token standard.
 *
 * Expected to be called within mocha context.
 *
 * @param {SuiteOptions} options
 */
module.exports = function (options) {
	const accounts = options.accounts

	// configure
	const initialSupply = bn(options.initialSupply, 0)
	const initialBalances = options.initialBalances || []
	const initialAllowances = options.initialAllowances || []
	const create = options.create

	let creditIsMinting = true
	let credit = async function (to, amount) {
		if (options.mint) {
			creditIsMinting = true
			return await options.mint(contract, to, amount)
		}
		else {
			creditIsMinting = false
			return await options.transfer(contract, to, amount)
		}
	}

	// setup
	const tokens = function (amount) { return bn(amount).imul(bn(10).pow(decimals)) }
	const uintMax = bn(2).pow(bn(256)).subn(1)
	const alice = accounts[1]
	const bob = accounts[2]
	const charles = accounts[3]

	let contract = null
	let decimals = 0

	beforeEach(async function () {
		contract = await create()
		decimals = (contract.decimals ? await contract.decimals.call() : 0)
		if (options.beforeEach) {
			await options.beforeEach(contract)
		}
	})

	afterEach(async function () {
		if (options.afterEach) {
			await options.afterEach(contract)
		}
		contract = null
		decimals = 0
	})

	describe('ERC-20', function () {
		describe('totalSupply()', function () {
			it('should have initial supply of ' + initialSupply.toString(), async function () {
				expect(await contract.totalSupply.call()).to.be.bignumber.equal(initialSupply)
			})

			it('should return the correct supply', async function () {
				await credit(alice, tokens(1))
				expect(await contract.totalSupply.call()).to.be.bignumber.equal(
					creditIsMinting ? initialSupply.add(tokens(1)) : initialSupply
				)

				await credit(alice, tokens(2))
				expect(await contract.totalSupply.call()).to.be.bignumber.equal(
					creditIsMinting ? initialSupply.add(tokens(3)) : initialSupply
				)

				await credit(bob, tokens(3))
				expect(await contract.totalSupply.call()).to.be.bignumber.equal(
					creditIsMinting ? initialSupply.add(tokens(6)) : initialSupply
				)
			})
		})

		describe('balanceOf(_owner)', function () {
			it('should have correct initial balances', async function () {
				for (const initialBalance of initialBalances) {
					let address = initialBalance[0]
					let balance = initialBalance[1]
					expect(await contract.balanceOf.call(address)).to.be.bignumber.equal(balance)
				}
			})

			it('should return the correct balances', async function () {
				await credit(alice, tokens(1))
				expect(await contract.balanceOf.call(alice)).to.be.bignumber.equal(tokens(1))

				await credit(alice, tokens(2))
				expect(await contract.balanceOf.call(alice)).to.be.bignumber.equal(tokens(3))

				await credit(bob, tokens(3))
				expect(await contract.balanceOf.call(bob)).to.be.bignumber.equal(tokens(3))
			})
		})

		describe('allowance(_owner, _spender)', function () {
			describeIt(when('_owner != _spender'), alice, bob)
			describeIt(when('_owner == _spender'), alice, alice)

			it('should have correct initial allowance', async function () {
				for (const initialAllowance of initialAllowances) {
					let owner = initialAllowance[0]
					let spender = initialAllowance[1]
					let expectedAllowance = initialAllowance[2]
					expect(await contract.allowance.call(owner, spender)).to.be.bignumber.equal(expectedAllowance)
				
				}
			})

			it('should return the correct allowance', async function () {
				await contract.approve(bob, tokens(1), { from: alice })
				await contract.approve(charles, tokens(2), { from: alice })
				await contract.approve(charles, tokens(3), { from: bob })
				await contract.approve(alice, tokens(4), { from: bob })
				await contract.approve(alice, tokens(5), { from: charles })
				await contract.approve(bob, tokens(6), { from: charles })

				expect(await contract.allowance.call(alice, bob)).to.be.bignumber.equal(tokens(1))
				expect(await contract.allowance.call(alice, charles)).to.be.bignumber.equal(tokens(2))
				expect(await contract.allowance.call(bob, charles)).to.be.bignumber.equal(tokens(3))
				expect(await contract.allowance.call(bob, alice)).to.be.bignumber.equal(tokens(4))
				expect(await contract.allowance.call(charles, alice)).to.be.bignumber.equal(tokens(5))
				expect(await contract.allowance.call(charles, bob)).to.be.bignumber.equal(tokens(6))
			})

			function describeIt(name, from, to) {
				describe(name, function () {
					it('should return the correct allowance', async function () {
						await contract.approve(to, tokens(1), { from: from })
						expect(await contract.allowance.call(from, to)).to.be.bignumber.equal(tokens(1))
					})
				})
			}
		})

		// NOTE: assumes that approve should always succeed
		describe('approve(_spender, _value)', function () {
			describeIt(when('_spender != sender'), alice, bob)
			describeIt(when('_spender == sender'), alice, alice)

			function describeIt(name, from, to) {
				describe(name, function () {
					it('should return true when approving 0', async function () {
						assert.isTrue(await contract.approve.call(to, 0, { from: from }))
					})

					it('should return true when approving', async function () {
						assert.isTrue(await contract.approve.call(to, tokens(3), { from: from }))
					})

					it('should return true when updating approval', async function () {
						assert.isTrue(await contract.approve.call(to, tokens(2), { from: from }))
						await contract.approve(to, tokens(2), { from: from })

						// test decreasing approval
						assert.isTrue(await contract.approve.call(to, tokens(1), { from: from }))

						// test not-updating approval
						assert.isTrue(await contract.approve.call(to, tokens(2), { from: from }))

						// test increasing approval
						assert.isTrue(await contract.approve.call(to, tokens(3), { from: from }))
					})

					it('should return true when revoking approval', async function () {
						await contract.approve(to, tokens(3), { from: from })
						assert.isTrue(await contract.approve.call(to, tokens(0), { from: from }))
					})

					it('should update allowance accordingly', async function () {
						await contract.approve(to, tokens(1), { from: from })
						expect(await contract.allowance(from, to)).to.be.bignumber.equal(tokens(1))

						await contract.approve(to, tokens(3), { from: from })
						expect(await contract.allowance(from, to)).to.be.bignumber.equal(tokens(3))

						await contract.approve(to, 0, { from: from })
						expect(await contract.allowance(from, to)).to.be.bignumber.equal('0')
					})

					it('should fire Approval event', async function () {
						await testApprovalEvent(from, to, tokens(1))
						if (from != to) {
							await testApprovalEvent(to, from, tokens(2))
						}
					})

					it('should fire Approval when allowance was set to 0', async function () {
						await contract.approve(to, tokens(3), { from: from })
						await testApprovalEvent(from, to, 0)
					})

					it('should fire Approval even when allowance did not change', async function () {
						// even 0 -> 0 should fire Approval event
						await testApprovalEvent(from, to, 0)

						await contract.approve(to, tokens(3), { from: from })
						await testApprovalEvent(from, to, tokens(3))
					})
				})
			}

			async function testApprovalEvent(from, to, amount) {
				let result = await contract.approve(to, amount, { from: from })
				let log = result.logs[0]
				assert.equal(log.event, 'Approval')
				assert.equal(log.args.owner, from)
				assert.equal(log.args.spender, to)
				expect(log.args.value).to.be.bignumber.equal(bn(amount))
			}
		})

		describe('transfer(_to, _value)', function () {
			describeIt(when('_to != sender'), alice, bob)
			describeIt(when('_to == sender'), alice, alice)

			function describeIt(name, from, to) {
				describe(name, function () {
					it('should return true when called with amount of 0', async function () {
						assert.isTrue(await contract.transfer.call(to, 0, { from: from }))
					})

					it('should return true when transfer can be made, false otherwise', async function () {
						await credit(from, tokens(3))
						assert.isTrue(await contract.transfer.call(to, tokens(1), { from: from }))
						assert.isTrue(await contract.transfer.call(to, tokens(2), { from: from }))
						assert.isTrue(await contract.transfer.call(to, tokens(3), { from: from }))

						await contract.transfer(to, tokens(1), { from: from })
						assert.isTrue(await contract.transfer.call(to, tokens(1), { from: from }))
						assert.isTrue(await contract.transfer.call(to, tokens(2), { from: from }))
					})

					it('should revert when trying to transfer something while having nothing', async function () {
						await expectRevertOrFail(contract.transfer(to, tokens(1), { from: from }))
					})

					it('should revert when trying to transfer more than balance', async function () {
						await credit(from, tokens(3))
						await expectRevertOrFail(contract.transfer(to, tokens(4), { from: from }))

						await contract.transfer('0x0000000000000000000000000000000000000001', tokens(1), { from: from })
						await expectRevertOrFail(contract.transfer(to, tokens(3), { from: from }))
					})

					it('should not affect totalSupply', async function () {
						await credit(from, tokens(3))
						let supply1 = await contract.totalSupply.call()
						await contract.transfer(to, tokens(3), { from: from })
						let supply2 = await contract.totalSupply.call()
						expect(supply2).to.be.be.bignumber.equal(supply1)
					})

					it('should update balances accordingly', async function () {
						await credit(from, tokens(3))
						let fromBalance1 = await contract.balanceOf.call(from)
						let toBalance1 = await contract.balanceOf.call(to)

						await contract.transfer(to, tokens(1), { from: from })
						let fromBalance2 = await contract.balanceOf.call(from)
						let toBalance2 = await contract.balanceOf.call(to)

						if (from == to) {
							expect(fromBalance2).to.be.bignumber.equal(fromBalance1)
						}
						else {
							expect(fromBalance2).to.be.bignumber.equal(fromBalance1.sub(tokens(1)))
							expect(toBalance2).to.be.bignumber.equal(toBalance1.add(tokens(1)))
						}

						await contract.transfer(to, tokens(2), { from: from })
						let fromBalance3 = await contract.balanceOf.call(from)
						let toBalance3 = await contract.balanceOf.call(to)

						if (from == to) {
							expect(fromBalance3).to.be.bignumber.equal(fromBalance2)
						}
						else {
							expect(fromBalance3).to.be.bignumber.equal(fromBalance2.sub(tokens(2)))
							expect(toBalance3).to.be.bignumber.equal(toBalance2.add(tokens(2)))
						}
					})

					it('should fire Transfer event', async function () {
						await testTransferEvent(from, to, tokens(3))
					})

					it('should fire Transfer event when transferring amount of 0', async function () {
						await testTransferEvent(from, to, 0)
					})
				})
			}

			async function testTransferEvent(from, to, amount) {
				if (amount > 0) {
					await credit(from, amount)
				}

				let result = await contract.transfer(to, amount, { from: from })
				let log = result.logs[0]
				assert.equal(log.event, 'Transfer')
				assert.equal(log.args.from, from)
				assert.equal(log.args.to, to)
				expect(log.args.value).to.be.bignumber.equal(bn(amount))
			}
		})

		describe('transferFrom(_from, _to, _value)', function () {
			describeIt(when('_from != _to and _to != sender'), alice, bob, charles)
			describeIt(when('_from != _to and _to == sender'), alice, bob, bob)
			describeIt(when('_from == _to and _to != sender'), alice, alice, bob)
			describeIt(when('_from == _to and _to == sender'), alice, alice, alice)

			it('should revert when trying to transfer while not allowed at all', async function () {
				await credit(alice, tokens(3))
				await expectRevertOrFail(contract.transferFrom(alice, bob, tokens(1), { from: bob }))
				await expectRevertOrFail(contract.transferFrom(alice, charles, tokens(1), { from: bob }))
			})

			it('should fire Transfer event when transferring amount of 0 and sender is not approved', async function () {
				await testTransferEvent(alice, bob, bob, 0)
			})

			function describeIt(name, from, via, to) {
				describe(name, function () {
					beforeEach(async function () {
						// by default approve sender (via) to transfer
						await contract.approve(via, tokens(3), { from: from })
					})

					it('should return true when called with amount of 0 and sender is approved', async function () {
						assert.isTrue(await contract.transferFrom.call(from, to, 0, { from: via }))
					})

					it('should return true when called with amount of 0 and sender is not approved', async function () {
						assert.isTrue(await contract.transferFrom.call(to, from, 0, { from: via }))
					})

					it('should return true when transfer can be made, false otherwise', async function () {
						await credit(from, tokens(3))
						assert.isTrue(await contract.transferFrom.call(from, to, tokens(1), { from: via }))
						assert.isTrue(await contract.transferFrom.call(from, to, tokens(2), { from: via }))
						assert.isTrue(await contract.transferFrom.call(from, to, tokens(3), { from: via }))

						await contract.transferFrom(from, to, tokens(1), { from: via })
						assert.isTrue(await contract.transferFrom.call(from, to, tokens(1), { from: via }))
						assert.isTrue(await contract.transferFrom.call(from, to, tokens(2), { from: via }))
					})

					it('should revert when trying to transfer something while _from having nothing', async function () {
						await expectRevertOrFail(contract.transferFrom(from, to, tokens(1), { from: via }))
					})

					it('should revert when trying to transfer more than balance of _from', async function () {
						await credit(from, tokens(2))
						await expectRevertOrFail(contract.transferFrom(from, to, tokens(3), { from: via }))
					})

					it('should revert when trying to transfer more than allowed', async function () {
						await credit(from, tokens(4))
						await expectRevertOrFail(contract.transferFrom(from, to, tokens(4), { from: via }))
					})

					it('should not affect totalSupply', async function () {
						await credit(from, tokens(3))
						let supply1 = await contract.totalSupply.call()
						await contract.transferFrom(from, to, tokens(3), { from: via })
						let supply2 = await contract.totalSupply.call()
						expect(supply2).to.be.be.bignumber.equal(supply1)
					})

					it('should update balances accordingly', async function () {
						await credit(from, tokens(3))
						let fromBalance1 = await contract.balanceOf.call(from)
						let viaBalance1 = await contract.balanceOf.call(via)
						let toBalance1 = await contract.balanceOf.call(to)

						await contract.transferFrom(from, to, tokens(1), { from: via })
						let fromBalance2 = await contract.balanceOf.call(from)
						let viaBalance2 = await contract.balanceOf.call(via)
						let toBalance2 = await contract.balanceOf.call(to)

						if (from == to) {
							expect(fromBalance2).to.be.bignumber.equal(fromBalance1)
						}
						else {
							expect(fromBalance2).to.be.bignumber.equal(fromBalance1.sub(tokens(1)))
							expect(toBalance2).to.be.bignumber.equal(toBalance1.add(tokens(1)))
						}

						if (via != from && via != to) {
							expect(viaBalance2).to.be.bignumber.equal(viaBalance1)
						}

						await contract.transferFrom(from, to, tokens(2), { from: via })
						let fromBalance3 = await contract.balanceOf.call(from)
						let viaBalance3 = await contract.balanceOf.call(via)
						let toBalance3 = await contract.balanceOf.call(to)

						if (from == to) {
							expect(fromBalance3).to.be.bignumber.equal(fromBalance2)
						}
						else {
							expect(fromBalance3).to.be.bignumber.equal(fromBalance2.sub(tokens(2)))
							expect(toBalance3).to.be.bignumber.equal(toBalance2.add(tokens(2)))
						}

						if (via != from && via != to) {
							expect(viaBalance3).to.be.bignumber.equal(viaBalance2)
						}
					})

					it('should update allowances accordingly', async function () {
						await credit(from, tokens(3))
						let viaAllowance1 = await contract.allowance.call(from, via)
						let toAllowance1 = await contract.allowance.call(from, to)

						await contract.transferFrom(from, to, tokens(2), { from: via })
						let viaAllowance2 = await contract.allowance.call(from, via)
						let toAllowance2 = await contract.allowance.call(from, to)

						expect(viaAllowance2).to.be.bignumber.equal(viaAllowance1.sub(tokens(2)))

						if (to != via) {
							expect(toAllowance2).to.be.bignumber.equal(toAllowance1)
						}

						await contract.transferFrom(from, to, tokens(1), { from: via })
						let viaAllowance3 = await contract.allowance.call(from, via)
						let toAllowance3 = await contract.allowance.call(from, to)

						expect(viaAllowance3).to.be.bignumber.equal(viaAllowance2.sub(tokens(1)))

						if (to != via) {
							expect(toAllowance3).to.be.bignumber.equal(toAllowance1)
						}
					})

					it('should fire Transfer event', async function () {
						await testTransferEvent(from, via, to, tokens(3))
					})

					it('should fire Transfer event when transferring amount of 0', async function () {
						await testTransferEvent(from, via, to, 0)
					})
				})
			}

			async function testTransferEvent(from, via, to, amount) {
				if (amount > 0) {
					await credit(from, amount)
				}

				let result = await contract.transferFrom(from, to, amount, { from: via })
				let log = result.logs[0]
				assert.equal(log.event, 'Transfer')
				assert.equal(log.args.from, from)
				assert.equal(log.args.to, to)
				expect(log.args.value).to.be.bignumber.equal(bn(amount))
			}
		})
	})

	describe('ERC-20 optional', function () {
		describe('name()', function () {
			if (options.name != null ) {
				it("should return '" + options.name + "'", async function () {
					assert.equal(await contract.name.call(), options.name)
				})
			}
		})

		describe('symbol()', function () {
			if (options.symbol != null) {
				it("should return '" + options.symbol + "'", async function () {
					assert.equal(await contract.symbol.call(), options.symbol)
				})
			}
		})

		describe('decimals()', function () {
			if (options.decimals != null) {
				it("should return '" + options.decimals + "'", async function () {
					expect(await contract.decimals.call()).to.be.bignumber.equal(bn(options.decimals))
				})
			}
		})
	})

	if (options.increasedecreaseAllowance) {
		describe('approvals', function () {
			describe('increaseAllowance(_spender, _addedValue)', function () {
				it('should return true when increasing approval', async function () {
					assert.isTrue(await contract.increaseAllowance.call(bob, 0, { from: alice }))
					assert.isTrue(await contract.increaseAllowance.call(bob, uintMax, { from: alice }))

					await contract.increaseAllowance(bob, tokens(3), { from: alice })
					assert.isTrue(await contract.increaseAllowance.call(bob, 0, { from: alice }))
					assert.isTrue(await contract.increaseAllowance.call(bob, tokens(3), { from: alice }))
				})

				it('should revert when approval cannot be increased', async function () {
					await contract.increaseAllowance(bob, tokens(1), { from: alice })
					await expectRevertOrFail(contract.increaseAllowance(bob, uintMax, { from: alice }))
				})

				it('should update allowance accordingly', async function () {
					await contract.increaseAllowance(bob, tokens(1), { from: alice })
					expect(await contract.allowance(alice, bob)).to.be.bignumber.equal(tokens(1))

					await contract.increaseAllowance(bob, tokens(2), { from: alice })
					expect(await contract.allowance(alice, bob)).to.be.bignumber.equal(tokens(3))

					await contract.increaseAllowance(bob, 0, { from: alice })
					expect(await contract.allowance(alice, bob)).to.be.bignumber.equal(tokens(3))
				})

				it('should fire Approval event', async function () {
					await testApprovalEvent(alice, bob, 0, tokens(1))
					await testApprovalEvent(alice, bob, tokens(1), tokens(2))
				})

				it('should fire Approval even when allowance did not change', async function () {
					await testApprovalEvent(alice, bob, 0, 0)

					await contract.increaseAllowance(bob, tokens(3), { from: alice })
					await testApprovalEvent(alice, bob, tokens(3), 0)
				})

				async function testApprovalEvent(from, to, fromAmount, byAmount) {
					let result = await contract.increaseAllowance(to, byAmount, { from: from })
					let log = result.logs[0]
					assert.equal(log.event, 'Approval')
					assert.equal(log.args.owner, from)
					assert.equal(log.args.spender, to)
					expect(log.args.value).to.be.bignumber.equal(bn(fromAmount).add(bn(byAmount)))
				}
			})

			describe('decreaseAllowance(_spender, _subtractedValue)', function () {
				beforeEach(async function () {
					await contract.approve(bob, tokens(3), { from: alice })
				})

				it('should return true when decreasing approval', async function () {
					assert.isTrue(await contract.decreaseAllowance.call(bob, 0, { from: alice }))
					assert.isTrue(await contract.decreaseAllowance.call(bob, tokens(3), { from: alice }))
				})

				it('should fire Approval event', async function () {
					await testApprovalEvent(alice, bob, tokens(3), tokens(1))
					await testApprovalEvent(alice, bob, tokens(2), tokens(2))
				})

				it('should fire Approval even when allowance did not change', async function () {
					await testApprovalEvent(alice, bob, tokens(3), 0)

					await contract.decreaseAllowance(bob, tokens(3), { from: alice })
					await testApprovalEvent(alice, bob, 0, 0)
				})

				async function testApprovalEvent(from, to, fromAmount, byAmount) {
					let result = await contract.decreaseAllowance(to, byAmount, { from: from })
					let log = result.logs[0]
					
					assert.equal(log.event, 'Approval')
					assert.equal(log.args.owner, from)
					assert.equal(log.args.spender, to)
					expect(log.args.value).to.be.bignumber.equal(bn(fromAmount).sub(bn(byAmount)))
				}
			})
		})
	}
}

/**
 * Formats the describe-case name.
 * @param {string} name
 */
function when(name) {
	return 'when (' + name + ')'
}
