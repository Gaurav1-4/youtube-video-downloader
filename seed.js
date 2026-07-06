import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const emails = [
  'gauravgoyal2112007@gmail.com',
  'studyonly.co@gmail.com',
  'carryoncrush@gmail.com',
  'tapsya998@gmail.com',
  'gaurav7015467655@gmail.com',
  'splicevoid@gmail.com',
  'gaurav25212@iiitd.ac.in'
];

async function seed() {
  console.log('Clearing old allowlist...');
  await redis.del('allowed_emails');
  
  console.log('Seeding new allowlist...');
  if (emails.length > 0) {
    await redis.sadd('allowed_emails', ...emails);
  }
  
  const members = await redis.smembers('allowed_emails');
  console.log('Current allowlist:', members);
  process.exit(0);
}

seed();
