export default async function handler(req, res) {
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
    // Forward the form data to Web3Forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully',
        redirect: 'https://www.right-path-house.com/thank-you'
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
      message: 'Server error. Please call us directly.'
    });
  }
}
