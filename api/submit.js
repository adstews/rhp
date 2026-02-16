module.exports = async function handler(req, res) {
  // Get the AMP source origin from the query string
  const sourceOrigin = req.query.__amp_source_origin || 'https://www.right-path-house.com';

  // Set AMP-required CORS headers
  res.setHeader('Access-Control-Allow-Origin', sourceOrigin);
  res.setHeader('AMP-Access-Control-Allow-Source-Origin', sourceOrigin);
  res.setHeader('Access-Control-Expose-Headers', 'AMP-Access-Control-Allow-Source-Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // req.body is already parsed by Vercel
    const formData = req.body || {};

    // Build URL-encoded string to forward to Web3Forms
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(formData)) {
      if (key !== '__amp_source_origin') {
        params.append(key, value);
      }
    }

    // Forward to Web3Forms with browser-like headers
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Origin': 'https://www.right-path-house.com',
        'Referer': 'https://www.right-path-house.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; RightPathHouse/1.0)'
      },
      body: params.toString(),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: 'Invalid response from form service'
      });
    }

    if (data.success) {
      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.message || 'Submission failed'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};
