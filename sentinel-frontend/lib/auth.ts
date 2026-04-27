export const saveAuth = (token: string, user: object) => {
  localStorage.setItem('sentinel_token', token);
  localStorage.setItem('sentinel_user', JSON.stringify(user));
};

export const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('sentinel_token')
    : null;

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('sentinel_user');
  return u ? JSON.parse(u) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('sentinel_token');
  localStorage.removeItem('sentinel_user');
};

export const isAuthenticated = () => !!getToken();
