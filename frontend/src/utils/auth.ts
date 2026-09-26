import Cookies from 'universal-cookie';
import { router } from '../routes/hook';

const cookies = new Cookies();

export const setAuthCookie = (b64: string) => {
  cookies.set('auth', b64, {
    path: '/',
    secure: false,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
  });
};

export const setEsTokenCookie = (token: string) => {
  cookies.set('es_token', token, {
    path: '/',
    secure: false,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
  });
};

export const getAuthCookie = () => {
  return cookies.get('auth');
};

export const getEsCookie = () => {
  return cookies.get('es_token');
};

export const clearAuthCookie = () => {
  cookies.remove('auth', { path: '/' });
};

export const clearEsTokenCookie = () => {
  cookies.remove('es_token', { path: '/' });
};

export const loginRedirect = (to: string) => {
  router.navigate(to, {
    replace: true,
    state: { justLoggedIn: true },
  });
};