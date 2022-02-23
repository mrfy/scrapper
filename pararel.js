const IP_GETTER_URL = 'https://api.myip.com/';
const baseUrl = 'http://www.example.pl/firmy/'

const puppeteer = require('puppeteer');
const fs = require('fs/promises')
const { mergeMap, toArray } = require("rxjs/operators");
const rxjs = require("rxjs");

const pagesStart = process.argv[2]
const pagesEnd = process.argv[3]
let pageNo = pagesStart
console.log('Scope: ', pagesStart, pagesEnd);

async function scrape(port) {
  const start = +new Date();

  if (pageNo > pagesEnd) {
    console.log('FINITO!!!', pagesStart, pagesEnd, pageNo)
    process.exit()
  }

  const results = await withBrowser(port, async (browser) => {
    const urlsy = await withPage(browser)(async (page) => {

      // const ipAddr = await retry(
      //   () => getCurrentIP(page),
      //   5 // retry this 5 times
      // );

      // console.log(' 🦾: ', pageNo, port, ipAddr.ip);
      console.log(' 🦾: ', pageNo, port);
      await retry(
        () => page.goto(`${baseUrl}${pageNo}`),
        5 // retry this 5 times
      );

      const urls = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.company-name a')).map(x => {
          return {
            name: x.textContent,
            link: x.getAttribute('href')
          }
        })
      })
      return urls;
    });

    return rxjs.from(urlsy).pipe(
      mergeMap(async (el) => {
        return withPage(browser)(async (page) => {
          await page.goto(`https://www.example.pl${el.link}`, {
            waitUntil: "load", timeout: 0
          })

          const mail = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.company-email a')).map(el => {
              return el.getAttribute('href')
            })
          })

          const phone = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.company-phone a')).map(el => {
              return el.getAttribute('data-expanded')
            })
          })

          return [el.name, mail[0], phone[0]];
        });
      }, 17),
      toArray(),
    ).toPromise();
  });

  var end = +new Date();
  var time = end - start;

  if (results.length > 1) {
    await fs.writeFile(`files1000/${pageNo}.txt`, results.join("\r\n"))
    console.log('✅Page:', pageNo, 'OK! ' + Math.trunc(time / 1000) + ' sec.');
    pageNo++
  } else {
    console.log('❌Retry page: ', pageNo)
  }
}

const withPage = (browser) => async (fn) => {
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920 + Math.floor(Math.random() * 100),
    height: 3000 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  });
  try {
    return await fn(page);
  } finally {
    await page.close();
  }
}

const withBrowser = async (port, fn) => {
  const browser = await puppeteer.launch({
    args: ['--proxy-server=socks5://127.0.0.1:' + port]
  });
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}

async function retry(promiseFactory, retryCount) {
  try {
    return await promiseFactory();
  } catch (error) {
    if (retryCount <= 0) {
      throw error;
    }
    console.log('retrying!', error.message)
    return await retry(promiseFactory, retryCount - 1);
  }
}

const getCurrentIP = async (page) => {
  await page.goto(IP_GETTER_URL, { waitUntil: 'load' });
  return page.$eval('body', (body) => JSON.parse(body.innerText));
};

async function main() {
  /**
   * Tor SOCKS ports that we defined in torrc file. 
   */
  const ports = [
    '9060',
    '9062',
    '9064',
    '9066',
    '9053',
    '9054',
    '9052',
    '9056',
    '9058',
    '9059',
  ];

  let shuffled = ports
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  /**
   * Scrape forever...
   */
  while (true) {
    for (const port of shuffled) {
      await scrape(port)
    }
  }
}

main()


