const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('..');

const should = chai.should();
chai.use(chaiHttp);

describe('Jobs', () => {
  after((done) => {
    server.close();
    done();
  });


  describe('Get jobs', () => {
    it('should return an array', (done) => {
      chai.request(server)
        .get('/api/jobs')
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
  describe('Get job/ready', () => {
    it('should return an error', (done) => {
      chai.request(server)
        .get('/api/job/ready')
        .query({ id_cluster: 0 })
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(400);
          res.body.status.should.equal("Le paramètre 'id_cluster' est invalide.");
          done();
        });
    });
  });
  describe('Post job', () => {
    it('should return an error', (done) => {
      chai.request(server)
        .post('/api/job')
        .query({ id: -1, status: 'failed', returnCode: 0 })
        .send({ log: 'string' })
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(400);
          res.body.status.should.equal("Le paramètre 'id' est invalide.");
          done();
        });
    });
  });
});
