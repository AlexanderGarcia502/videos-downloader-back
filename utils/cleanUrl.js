function cleanUrl(url) {
    const urlObj = new URL(url);
    return `${urlObj.origin}${urlObj.pathname}`;
  }

module.exports = cleanUrl;