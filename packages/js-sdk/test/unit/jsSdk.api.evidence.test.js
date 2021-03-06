import Debug from 'debug'
import DdnUtils from '@ddn/utils'
import { DdnJS, node } from '../ddn-js'

const debug = Debug('debug')

// 这里有两种创建存证交易的方法
const createEvidence = DdnJS.evidence.createEvidence

async function createPluginAsset (type, asset, secret) {
  return await DdnJS.assetPlugin.createPluginAsset(type, asset, secret)
}

describe('Test createEvidence', () => {
  let transaction
  let evidence
  let evidence2

  beforeAll(done => {
    debug('beforeAll starting ...')
    const ipid = node.randomIpId()

    debug(`beforeAll ipid: ${ipid}`)

    evidence = {
      ipid: ipid,
      title: node.randomUsername(),
      description: `${ipid} has been evidence.`,
      hash: 'f082022ee664008a1f15d62514811dfd',
      author: 'Evanlai',
      size: '2448kb',
      type: 'html',
      url: 'dat://f76e1e82cf4eab4bf173627ff93662973c6fab110c70fb0f86370873a9619aa6+18/public/test.html',
      tags: 'world,cup,test'
    }

    const ipid2 = node.randomIpId()
    evidence2 = {
      ipid: ipid2,
      title: node.randomUsername(),
      description: `${ipid} has been evidence.`,
      hash: 'f082022ee664008a1f15d62514811dfd',
      author: 'Evanlai',
      size: '2448kb',
      type: 'html',
      url: 'dat://f76e1e82cf4eab4bf173627ff93662973c6fab110c70fb0f86370873a9619aa6+18/public/test.html',
      tags: 'world,cup,test',
      ext: 'china',
      ext1: 12345,
      ext2: new Date()
    }

    node.expect(evidence).to.be.not.equal(evidence2)
    debug(`beforeAll end: ${JSON.stringify(evidence2)}`)

    done()
  })

  it('CreateEvidence Should be ok', async (done) => {
    transaction = await createEvidence(evidence, node.Gaccount.password)
    debug(`transaction: ${JSON.stringify(transaction)}`)

    node.peer.post('/transactions')
      .set('Accept', 'application/json')
      .set('version', node.version)
      .set('nethash', node.config.nethash)
      .set('port', node.config.port)
      .send({
        transaction
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, {
        body
      }) => {
        debug('CreateEvidence: ', JSON.stringify(body))
        node.expect(err).to.be.not.ok
        node.expect(body).to.have.property('success').to.be.true
        done()
      })
  })

  it('Get /evidences/ipid/:ipid should be ok', async done => {
    // debug(`onNewBlock: ${ipid}`)
    // await node.onNewBlockAsync()
    node.onNewBlock(err => {
      debug('onNewBlock 2..')

      node.expect(err).to.be.not.ok
      debug(`/evidences/ipid/${evidence.ipid}`, evidence.ipid)

      node.api.get(`/evidences/ipid/${evidence.ipid}`)
        .set('Accept', 'application/json')
        .set('version', node.version)
        .set('nethash', node.config.nethash)
        .set('port', node.config.port)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, {
          body
        }) => {
          debug(`/evidences/ipid/${evidence.ipid}`, JSON.stringify(body))

          node.expect(err).to.be.not.ok
          node.expect(body).to.have.property('success').to.be.true
          node.expect(body).to.have.property('result').not.null

          node.expect(body.result).to.have.property('transaction_id')

          node.expect(body.result.transaction_type).to.equal(transaction.type)
          node.expect(body.result.ipid).to.equal(evidence.ipid)

          done()
        })
    })
  })

  describe('Asset puglin Test', () => {
    it('POST peers/transactions, Should be ok', async (done) => {
      const transaction = await createPluginAsset(DdnUtils.assetTypes.EVIDENCE, evidence2, node.Gaccount.password)

      node.peer.post('/transactions')
        .set('Accept', 'application/json')
        .set('version', node.version)
        .set('nethash', node.config.nethash)
        .set('port', node.config.port)
        .send({
          transaction
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, {
          body
        }) => {
          debug('Asset puglin body: ', JSON.stringify(body))
          node.expect(err).to.be.not.ok
          node.expect(body).have.property('success').be.true

          done()
        })
    })
  })
})
