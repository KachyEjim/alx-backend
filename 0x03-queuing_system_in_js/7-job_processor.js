import kue from 'kue';

const blacklistedNumbers = [
    '4153518780',
    '4153518781'
];

const queue = kue.createQueue();

function sendNotification(phoneNumber, message, job, done) {
    job.progress(0, 100);

    if (blacklistedNumbers.includes(phoneNumber)) {
        const error = new Error(`Phone number ${phoneNumber} is blacklisted`);
        job.failed();
        job.save();
        done(error);
    } else {
        job.progress(50, 100);

        console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);

        setTimeout(() => {
            job.progress(100, 100);

            job.complete();
            console.log(`Notification job ${job.id} completed`);

            done();
        }, 1000);
    }
}

queue.process('push_notification_code_2', 2, (job, done) => {
    sendNotification(job.data.phoneNumber, job.data.message, job, done);
});
