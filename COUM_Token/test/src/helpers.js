'use strict'

/**
 * Converts given value to BN object if it is number or string. Otherwise defaultValue is
 * returned in case given value is not truthy.
 *
 * @param {number|string|BN|null} number
 * @param {number|string|BN|null} [defaultValue]
 * @returns {BN|null}
 */
export function bn(number, defaultValue = null) {
	if (number == null) {
		if (defaultValue == null) {
			return null;
		}
		number = defaultValue;
	}
	return web3.utils.toBN(number);
}

/**
 * Asserts that given promise will throw because of revert().
 * @param {Promise} promise
 */
export async function expectRevert(promise) {
	await expectError(promise, ['revert'])
}

/**
 * Asserts that given promise will throw because of revert() or failed assertion.
 * @param {Promise} promise
 */
export async function expectRevertOrFail(promise) {
	await expectError(promise, ['revert', 'invalid opcode'])
}

/**
 * Asserts that given promise will throw and that thrown message will contain one of the given
 * search strings.
 *
 * @param {Promise} promise The promise expecting to throw.
 * @param {string[]} messages List of expected thrown message search strings.
 */
async function expectError(promise, messages) {
	try {
		await promise
	} catch (error) {
		for (let i = 0; i < messages.length; i++) {
			if (error.message.search(messages[i]) >= 0) {
				return
			}
		}
		assert.fail("Expected revert, got '" + error + "' instead.")
	}
	assert.fail('Expected revert not received.')
}
