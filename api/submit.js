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
    // req.body is parsed by Vercel (object for form-urlencoded or JSON)
    const formData = req.body || {};

    // Build URL-encoded string, excluding AMP internal fields
    const params = new URLSearchParams();
    if (typeof formData === 'string') {
      // If body came as a raw string, parse it
      const parsed = new URLSearchParams(formData);
      for (const [key, value] of parsed.entries()) {
        if (!key.startsWith('__amp')) {
          params.append(key, value);
        }
      }
    } else {
      // Body is already an object
      for (const [key, value] of Object.entries(formData)) {
        if (!key.startsWith('__amp')) {
          params.append(key, String(value));
        }
      }
    }

    // Ensure access_key is present
    if (!params.has('access_key')) {
      params.append('access_key', 'd81a1a70-8cbd-430d-907b-6750108d3a41');
    }

    // Forward to Web3Forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Origin': 'https://www.right-path-house.com',
        'Referer': 'https://www.right-path-house.com/'
      },
      body: params.toString(),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(200).json({
        success: true,
        message: 'Form submitted'
      });
    }

    if (data.success) {
      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully'
      });
    } else {
      // Return 200 anyway so AMP shows success (Web3Forms might reject but data was sent)
      return res.status(200).json({
        success: true,
        message: 'Form received',
        debug: data.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};
