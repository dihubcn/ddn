import DdnUtils from '@ddn/utils';

import crypto from '../utils/crypto';
import constants from "../constants";
import slots from "../time/slots";
import options from '../options';

async function createVote(keyList, secret, secondSecret) {
	const keys = crypto.getKeys(secret);

	const transaction = {
		type: DdnUtils.assetTypes.VOTE,
		nethash: options.get('nethash'),
		amount: "0", 
		fee: constants.net.fees.vote,
		recipientId: null,
		senderPublicKey: keys.public_key,
		timestamp: slots.getTime() - options.get('clientDriftSeconds'),
		asset: {
			vote: {
				votes: keyList
			}
		}
	};

	await crypto.sign(transaction, keys);

	if (secondSecret) {
		const secondKeys = crypto.getKeys(secondSecret);
		await crypto.secondSign(transaction, secondKeys);
	}

	// transaction.id = await crypto.getId(transaction);

	return transaction;
}

export default {
	createVote
};
