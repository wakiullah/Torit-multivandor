import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../lib/features/user/userSlice';
import SignupForm from '../components/auth/SignupForm';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';

// Mock the next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        token: 'test-token',
      }),
  })
);

const renderWithRedux = (
  ui,
  {
    preloadedState,
    store = configureStore({
      reducer: { user: userReducer },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
  };
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

describe('SignupForm', () => {
  it('should update the navbar after successful signup', async () => {
    const { store } = renderWithRedux(
      <>
        <Navbar />
        <SignupForm />
      </>
    );

    // Initially, the user is not logged in
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();

    // Fill out and submit the signup form
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Wait for the signup process to complete
    await waitFor(() => {
      // Check if the user's name is displayed in the navbar
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Check if the Redux store was updated
    const state = store.getState();
    expect(state.user.user.name).toBe('Test User');
    expect(state.user.user.token).toBe('test-token');

    // Check if the router was called to redirect to the home page
    const { push } = useRouter();
    expect(push).toHaveBeenCalledWith('/');
  });
});
