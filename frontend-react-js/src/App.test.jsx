import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, afterEach } from 'vitest';
import Cookies from 'js-cookie';
import HomeFeedPage from './pages/HomeFeedPage';
import ActivityForm from './components/ActivityForm';
import SigninPage from './pages/SigninPage';
import { MemoryRouter } from 'react-router-dom';

const activity = {
  uuid: 'fixture-1', display_name: 'Fixture User', handle: 'fixture',
  message: 'Fixture home activity', created_at: '2026-11-09T12:00:00Z',
  replies_count: 0, reposts_count: 0, likes_count: 0,
};
afterEach(() => { vi.unstubAllGlobals(); Cookies.remove('user.email'); Cookies.remove('user.password'); });

test('home renders fetched activity and inline SVG navigation', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: async () => [activity] });
  vi.stubGlobal('fetch', fetchMock);
  const { container } = render(<MemoryRouter><HomeFeedPage /></MemoryRouter>);
  expect(await screen.findByText('Fixture home activity')).toBeInTheDocument();
  expect(fetchMock.mock.calls[0][0]).toBe('/api/activities/home');
  expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/signin');
  expect(container.querySelector('nav svg')).not.toBeNull();
});

test('activity form posts the chosen message and closes on success', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: async () => activity });
  vi.stubGlobal('fetch', fetchMock);
  const setActivities = vi.fn(), setPopped = vi.fn();
  render(<ActivityForm popped={true} setActivities={setActivities} setPopped={setPopped} />);
  fireEvent.change(screen.getByPlaceholderText('what would you like to say?'), { target: { value: 'Fixture post' } });
  fireEvent.click(screen.getByRole('button', { name: 'Crud' }));
  await waitFor(() => expect(setPopped).toHaveBeenCalledWith(false));
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe('/api/activities');
  expect(JSON.parse(options.body)).toEqual({ message: 'Fixture post', ttl: '7-days' });
  expect(setActivities.mock.calls[0][0]([])).toEqual([activity]);
});

test('demo sign-in rejects unmatched synthetic credentials', async () => {
  const { container } = render(<MemoryRouter><SigninPage /></MemoryRouter>);
  fireEvent.change(container.querySelector('input[type=text]'), { target: { value: 'fixture@example.invalid' } });
  fireEvent.change(container.querySelector('input[type=password]'), { target: { value: 'synthetic-test-only' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
  expect(await screen.findByText("Email and password is incorrect or account doesn't exist")).toBeInTheDocument();
});


test('Router 7 preserves @handle profile and direct-message URL contracts', async () => {
  const fetchMock = vi.fn(async url => ({ status: 200, json: async () => url.includes('/api/activities/') ? [activity] : [] }));
  vi.stubGlobal('fetch', fetchMock);
  const { default: App, router } = await import('./App');
  await router.navigate('/@fixture');
  render(<App />);
  expect(await screen.findByText('Fixture home activity')).toBeInTheDocument();
  expect(fetchMock.mock.calls.some(([url]) => url === '/api/activities/@fixture')).toBe(true);
  await act(async () => { await router.navigate('/messages/@fixture'); });
  await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => url === '/api/messages/@fixture')).toBe(true));
  expect(document.querySelector('.message_groups')).not.toBeNull();
});
