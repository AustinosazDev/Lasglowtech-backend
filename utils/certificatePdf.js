/**
 * Renders certificate HTML to a PDF buffer (A4 landscape) for email attachments.
 * Requires `puppeteer` (Chromium). Set PUPPETEER_EXECUTABLE_PATH if Chromium is not auto-detected.
 */
const certificateHtmlToPdfBuffer = async (html) => {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    throw new Error('puppeteer is not installed. Run npm install in the server folder.');
  }

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 850, deviceScaleFactor: 2 });
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    try {
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      });
    } catch (_) {
      await new Promise((r) => setTimeout(r, 1200));
    }
    await new Promise((r) => setTimeout(r, 400));

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
};

module.exports = { certificateHtmlToPdfBuffer };
