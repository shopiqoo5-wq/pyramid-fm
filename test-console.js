const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', err => {
    console.error('PAGE EXCEPTION:', err.message);
  });
  
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`NETWORK ERROR: ${response.status()} ${response.url()}`);
    }
  });

  console.log('Navigating to http://localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Page loaded successfully.');
    
    // Check if error boundary is visible
    const content = await page.content();
    if (content.includes('Something went wrong.')) {
      console.log('ERROR BOUNDARY RENDERED!');
    }
    
  } catch (err) {
    console.error('Failed to load page:', err.message);
  }
  
  await browser.close();
})();
