const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('..');

const should = chai.should();
chai.use(chaiHttp);

describe('Projects', () => {
  after((done) => {
    server.close();
    done();
  });

  describe('Get projects', () => {
    it('should return an array', (done) => {
      chai.request(server)
        .get('/api/projects')
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
  describe('Put project', () => {
    it('insert a valid project', (done) => {
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
            {
              name: 'Chantier 2',
              jobs: [
                {
                  name: 'jobs 1',
                  command: 'touch file1',
                },
              ],
              deps: [
                {
                  id: 0,
                },
              ],
            },
          ],
        })
        .end((err, res) => {
          should.equal(err, null);
          res.should.have.status(200);
          done();
        });
    });
  });
});
