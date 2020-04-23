import crypto from "./crypto";
import constants from "../constants";
import DdnUtils from '@ddn/utils';
import slots from "../time/slots";
import options from '../options';

function createUsername(name, secret, secondSecret) {
    const keys = crypto.getKeys(secret);

    if (!name || name.length == 0) {
        throw new Error('Invalid name format')
    }
    const fee = constants.fees.username;

    const transaction = {
        type: DdnUtils.assetTypes.USERINFO,
        nethash: options.get('nethash'),
        amount: "0", //Bignum update
        fee: `${fee}`,
        recipientId: null,
        senderPublicKey: keys.public_key,
        timestamp: slots.getTime() - options.get('clientDriftSeconds'),
        asset: {
            userinfo: {
                username: name
            }
        },
    };

    crypto.sign(transaction, keys)

    if (secondSecret) {
        const secondKeys = crypto.getKeys(secondSecret);
        crypto.secondSign(transaction, secondKeys)
    }
    // transaction.id = crypto.getId(transaction)
    return transaction
}

export default {
    createUsername
};