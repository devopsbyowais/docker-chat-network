const axios = require('axios');
const readline = require('readline-sync');

const targets = ['http://nginx']; // nginx load balances to rooms

async function main() {
  while (true) {
    const message = readline.question("Enter message: ");
    await axios.post(`${targets[0]}/message`, { message });
    console.log("Message sent!\n");
  }
}

main();

