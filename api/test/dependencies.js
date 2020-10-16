const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('..');

const should = chai.should();
chai.use(chaiHttp);
let idJob;

describe('Dependencies', () => {
  before((done) => {
    chai.request(server)
      .put('/api/project')
      .send({
        projects: [
          {
            name: 'Chantier 1',
            jobs: [
              {
                name: 'jobs 1',
                command: 'touch file1',
              },
              {
                name: 'jobs 2',
                command: 'touch file2',
              },
              {
                name: 'jobs 3',
                command: 'touch file3',
                deps: [
                  {
                    id: 0,
                  },
                  {
                    id: 1,
                  },
                ],
              },
            ],
          },
        ],
      })
      .end((err, res) => {
        should.equal(err, null);
        res.should.have.status(200);
        chai.request(server)
          .get('/api/jobs')
          .end((err2, res2) => {
            should.equal(err2, null);
            res2.should.have.status(200);
            res2.body.should.be.an('array');
            idJob = res2.body[0].id;
            done();
          });
      });
  });

  after((done) => {
    server.close();
    done();
  });

  describe('Get dependency', () => {
    it('should return an array', (done) => {
      chai.request(server)
        .get('/api/dependencies')
        .query({ id_job: idJob })
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
});
