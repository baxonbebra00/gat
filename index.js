const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function sendHttpRequest() {
  try {
    const targetUrl = await askTargetUrl();
    const proxy = await setupProxyAgent();
    const agent = new HttpsProxyAgent(`http://${proxy.ipAddress}:${proxy.port}`);
    const userAgent = getRandomUserAgent();

    const response = await axios.post(targetUrl, null, {
      httpsAgent: agent,
      headers: {
        'User-Agent': userAgent
      }
    });

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

async function askTargetUrl() {
  return new Promise((resolve, reject) => {
    rl.question('Введите URL сайта для проверки: ', (answer) => {
      resolve(answer);
    });
  });
}

async function setupProxyAgent() {
  try {
    const response = await axios.get('https://hidemy.io/ru/proxy-list/?maxtime=70#list');
    const proxyList = extractProxyList(response.data);

    if (proxyList.length === 0) {
      throw new Error('Не удалось получить список прокси');
    }

    const proxy = getRandomProxy(proxyList);
    const [ip, port] = proxy.split(':');

    return { ipAddress: ip, port: port };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function extractProxyList(html) {
  const regex = /((?:\d{1,3}\.){3}\d{1,3}:\d+)/g;
  return html.match(regex) || [];
}

function getRandomProxy(proxyList) {
  const randomIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[randomIndex];
}

function getRandomUserAgent() {
  const users = fs.readFileSync('users.txt', 'utf8').split('\n');
  const randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}

sendHttpRequest();
