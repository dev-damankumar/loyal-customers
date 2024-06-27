const fs = require('fs');

function readLogFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const logData = data
        .trim()
        .split('\n')
        .map((line) => {
          let [timestamp, pageId, customerId] = line.split(',');
          customerId = customerId.replace('\r', '');
          return { timestamp, pageId, customerId };
        });

      resolve(logData);
    });
  });
}

function getCustomerPageVisits(logData) {
  const customerPages = new Map();
  logData.forEach(({ pageId, customerId }) => {
    if (!customerPages.has(customerId)) {
      customerPages.set(customerId, new Set());
    }
    customerPages.get(customerId).add(pageId);
  });
  return customerPages;
}

async function getLoyalCustomers(logFileDay1, logFileDay2) {
  const logDataDay1 = await readLogFile(logFileDay1);
  const logDataDay2 = await readLogFile(logFileDay2);

  const customerPagesDay1 = getCustomerPageVisits(logDataDay1);
  const customerPagesDay2 = getCustomerPageVisits(logDataDay2);

  const loyalCustomers = [];

  customerPagesDay1.forEach((pagesDay1, customerId) => {
    const pagesDay2 = customerPagesDay2.get(customerId);
    if (pagesDay2 && pagesDay1.size >= 2 && pagesDay2.size >= 2) {
      loyalCustomers.push(customerId);
    }
  });

  return loyalCustomers;
}

(async () => {
  try {
    const logFileDay1 = 'log_day1.txt';
    const logFileDay2 = 'log_day2.txt';
    const loyalCustomers = await getLoyalCustomers(logFileDay1, logFileDay2);
    console.log('Loyal customers:', loyalCustomers);
  } catch (error) {
    console.error('Error:', error);
  }
})();
