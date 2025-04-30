const axios = require('axios');
const qs = require('qs');
const faker = require('faker');
const randomUseragent = require('random-useragent');
const readline = require('readline-sync');

// Ambil referral code dari input user
const refCode = readline.question('Masukkan Referral Code: ');
const totalAkun = parseInt(readline.question('Berapa akun yang ingin dibuat? '), 10);

// Fungsi buat password kuat
function generateStrongPassword() {
  const upper = faker.random.alpha({ count: 1, upcase: true });
  const lower = faker.random.alpha({ count: 5, upcase: false });
  const number = faker.datatype.number({ min: 10, max: 99 });
  const symbol = '!@#$%^&*()_+-='.charAt(Math.floor(Math.random() * 13));
  return `${upper}${lower}${number}${symbol}`;
}

// Fungsi utama
async function registerAndTask(index) {
  const fullName = faker.name.findName();
  const username = faker.internet.userName(fullName).toLowerCase();
  const domain = Math.random() < 0.5 ? 'gmail.com' : 'yahoo.com';
  const email = `${username}${faker.datatype.number({ min: 100, max: 999 })}@${domain}`;
  const password = generateStrongPassword();
  const userAgent = randomUseragent.getRandom();

  const data = qs.stringify({
    username,
    email,
    password,
    confirm_password: password,
    terms: 'on'
  });

  const registerConfig = {
    method: 'POST',
    url: `https://s0xlayer.com/register.php?ref=${refCode}`,
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data,
    maxRedirects: 0,
    validateStatus: status => status >= 200 && status < 400
  };

  try {
    const res = await axios.request(registerConfig);
    const cookies = res.headers['set-cookie'];
    const sessionMatch = cookies?.find(c => c.includes('PHPSESSID'));
    const sessionId = sessionMatch?.match(/PHPSESSID=([^;]+)/)?.[1];
    if (!sessionId) throw new Error('Gagal ambil PHPSESSID');

    console.log(`\n[${index}] ${fullName}`);
    console.log(`Username : ${username}`);
    console.log(`Email    : ${email}`);
    console.log(`Password : ${password}`);
    console.log(`UserAgent: ${userAgent}`);
    console.log(`PHPSESSID: ${sessionId}`);

    for (let i = 1; i <= 8; i++) {
      const taskConfig = {
        method: 'GET',
        url: `https://s0xlayer.com/dashboard.php?complete_task=${i}`,
        headers: {
          'User-Agent': userAgent,
          'Cookie': `PHPSESSID=${sessionId}; theme=dark`
        }
      };

      const taskRes = await axios.request(taskConfig);
      console.log(`Task ${i} => Status: ${taskRes.status}`);
    }

    console.log(`[SUKSES] Akun ${index} selesai.\n`);
  } catch (err) {
    console.error(`[GAGAL ${index}]`, err.message);
  }
}

// Jalankan untuk jumlah akun yang diminta
(async () => {
  for (let i = 1; i <= totalAkun; i++) {
    await registerAndTask(i);
  }
})();
