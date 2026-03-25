const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (response.headers.get('content-type')?.includes('text/csv')) {
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  baseUrl: API_URL,
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: (token) => request('/auth/me', { token }),
  getOffers: (token) => request('/offers', { token }),
  createOffer: (token, body) => request('/offers', { method: 'POST', token, body }),
  updateOffer: (token, id, body) => request(`/offers/${id}`, { method: 'PUT', token, body }),
  deleteOffer: (token, id) => request(`/offers/${id}`, { method: 'DELETE', token }),
  getLinks: (token) => request('/admin/links', { token }),
  createLinks: (token, body) => request('/admin/links', { method: 'POST', token, body }),
  exportLinks: (token) => request('/admin/links/export', { token, headers: { Accept: 'text/csv' } }),
  claimLink: (body) => request('/public/claim', { method: 'POST', body }),
  spin: (body) => request('/public/spin', { method: 'POST', body })
};
