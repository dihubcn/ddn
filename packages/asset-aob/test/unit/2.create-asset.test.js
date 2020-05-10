import node from '@ddn/node-sdk/lib/test';

// async function createTransfer(address, amount, secret) {
//     return node.ddn.dao.createTransfer(address, amount, secret)
// }

async function createPluginAsset(type, asset, secret, secondSecret) {
    return await node.ddn.assetPlugin.createPluginAsset(type, asset, secret, secondSecret)
}

describe("AOB Test", () => {

    // 加载插件
    // node.ddn.init();

    test("注册资产 Should be ok", async (done) => {
        const obj = {
            name: "DDD.NCR",
            desc: "DDD新币种",
            maximum: "100000000",
            precision: 2,
            strategy: '',
            allow_blacklist: '1',
            allow_whitelist: '1',
            allow_writeoff: '1',
            fee: '50000000000'
        };

        const transaction = await createPluginAsset(61, obj, node.Eaccount.password, "DDD12345");

        // var transaction = node.ddn.aob.createAsset("DDD.NCR", "DDD新币种", "100000000", 2, '', 0, 0, 0, node.Eaccount.password, "DDD12345");

        // console.log('transaction:', transaction)

        node.peer.post("/transactions")
            .set("Accept", "application/json")
            .set("version", node.version)
            .set("nethash", node.config.nethash)
            .set("port", node.config.port)
            .send({
                transaction
            })
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, {
                body
            }) => {
                // console.log('res.body', res.body);

                node.expect(err).to.be.not.ok;
                node.expect(body).to.have.property("success").to.be.true;

                done();
            });

    })

});