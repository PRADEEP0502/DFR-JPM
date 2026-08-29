// Serverless function proxy for Vercel / Cloud deployments
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pageNumber = '1', pagesize = '50', modifiedAfter } = req.query || {};

  try {
    const targetUrl = new URL('http://103.168.241.16/BillpassingApplication/api/approval/GetBillsInward');
    targetUrl.searchParams.set('pageNumber', pageNumber);
    targetUrl.searchParams.set('pagesize', pagesize);
    if (modifiedAfter) {
      targetUrl.searchParams.set('modifiedAfter', modifiedAfter);
    }

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        Success: false,
        ErrorMessage: `Upstream ERP error: HTTP ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Selsoft ERP proxy error:', error);
    return res.status(502).json({
      Success: false,
      ErrorMessage: error.message || 'Failed to connect to Selsoft ERP API',
    });
  }
}
