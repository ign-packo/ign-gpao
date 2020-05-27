const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('..');

const should = chai.should();
chai.use(chaiHttp);

describe('Clusters', () => {
  after((done) => {
    server.close();
    done();
  });

  describe('Get clusters', () => {
    it('should return an array', (done) => {
      chai.request(server)
        .get('/api/clusters')
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
  describe('Put cluster', () => {
    it('insert a valid cluster', (done) => {
      chai.request(server)
        .put('/api/cluster')
        .query({ host: 'a name' })
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
});
