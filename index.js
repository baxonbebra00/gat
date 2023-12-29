const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');

const targetUrl = 'http://example.com';  // Замените на целевой URL
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0'
];  // Замените на свои собственные юзерагенты

async function sendHttpRequest() {
  try {
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
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

sendHttpRequest();
