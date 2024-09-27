import express from 'express';
import redis from 'redis';
import { promisify } from 'util';
import kue from 'kue';

const app = express();
const port = 1245;

// Create a Redis client and promisify its methods
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Kue queue creation
const queue = kue.createQueue();

// Variables
let reservationEnabled = true;

// Function to reserve seats in Redis
const reserveSeat = async (number) => {
    await setAsync('available_seats', number);
};

// Function to get current available seats from Redis
const getCurrentAvailableSeats = async () => {
    const seats = await getAsync('available_seats');
    return seats ? parseInt(seats, 10) : 0;
};

// Set initial available seats to 50 when starting the server
reserveSeat(50);

// Route to get the number of available seats
app.get('/available_seats', async (req, res) => {
    const availableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats: availableSeats });
});

// Route to reserve a seat
app.get('/reserve_seat', (req, res) => {
    if (!reservationEnabled) {
        return res.json({ status: 'Reservation are blocked' });
    }

    // Queue a job to reserve a seat
    const job = queue.create('reserve_seat').save((err) => {
        if (err) {
            return res.json({ status: 'Reservation failed' });
        }
        res.json({ status: 'Reservation in process' });
    });

    job.on('complete', () => {
        console.log(`Seat reservation job ${job.id} completed`);
    });

    job.on('failed', (errMsg) => {
        console.log(`Seat reservation job ${job.id} failed: ${errMsg}`);
    });
});

// Route to process the queue
app.get('/process', (req, res) => {
    res.json({ status: 'Queue processing' });

    queue.process('reserve_seat', async (job, done) => {
        const availableSeats = await getCurrentAvailableSeats();

        // If no seats are available, fail the job
        if (availableSeats <= 0) {
            reservationEnabled = false;
            return done(new Error('Not enough seats available'));
        }

        // Otherwise, reserve a seat and update Redis
        const newAvailableSeats = availableSeats - 1;
        await reserveSeat(newAvailableSeats);

        if (newAvailableSeats === 0) {
            reservationEnabled = false;
        }

        done();
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
