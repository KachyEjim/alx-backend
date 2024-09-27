import kue from 'kue';
import { expect } from 'chai';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', function () {
  let queue;

  // Run before all tests
  before(() => {
    // Create a new queue and set it to test mode
    queue = kue.createQueue();
    queue.testMode = true;
  });

  // Run after all tests
  after(() => {
    // Clear the queue and exit test mode
    queue.testMode = false;
    queue.shutdown(() => {
      console.log('Queue shutdown');
    });
  });

  it('should display an error message if jobs is not an array', function () {
    expect(() => createPushNotificationsJobs({}, queue)).to.throw('Jobs is not an array');
  });

  it('should create jobs in the queue', function (done) {
    const list = [
      {
        phoneNumber: '4153518780',
        message: 'This is the code 1234 to verify your account'
      },
      {
        phoneNumber: '4153518781',
        message: 'This is the code 4562 to verify your account'
      }
    ];

    createPushNotificationsJobs(list, queue);

    setImmediate(() => {
      const jobs = queue.testMode.jobs;
      expect(jobs).to.have.lengthOf(2);
      expect(jobs[0].type).to.equal('push_notification_code_3');
      expect(jobs[1].type).to.equal('push_notification_code_3');

      done();
    });
  });
});
