import bcrypt from 'bcrypt';

const storedHash = '$2b$10$GussFIjdS1tSSYcq159.seAoKSk2R/jtu14WR44L1nsQHwYssjUDK';

console.log('Is stored hash a valid bcrypt hash?', bcrypt.getRounds(storedHash) > 0);

// Try verifying with an empty string password
bcrypt.compare('', storedHash, (err, result) => {
  if (err) {
    console.error('Error comparing empty password:', err);
  } else {
    console.log('Empty password verification result:', result);
  }
});

// Try verifying with a space character password
bcrypt.compare(' ', storedHash, (err, result) => {
  if (err) {
    console.error('Error comparing space password:', err);
  } else {
    console.log('Space password verification result:', result);
  }
});