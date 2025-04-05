import { jest } from '@jest/globals';
import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

/**
 * ------------------------------------------------------------
 * Mocks Setup
 * ------------------------------------------------------------
 */

// Mock useNavigate from react-router-dom to capture navigation calls
// This allows us to verify that navigation occurs with the correct route.
const mockNavigate = jest.fn();
jest.unstable_mockModule('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock MUI TextField to simplify it into a plain HTML input element for testing
// This avoids potential complexity from the real Material UI component.
await jest.unstable_mockModule('@mui/material/TextField', () => ({
  default: (props) => {
    // Remove InputProps so that it is not passed to the native input element
    const { InputProps, ...rest } = props;
    return (
        <input
            type="text"
            placeholder={props.placeholder || "Name your set"}
            {...rest}
        />
    );
  },
}));

// Mock the MUI Close icon component to simply return a text string.
// This helps us easily identify the icon in our tests without rendering the actual SVG.
await jest.unstable_mockModule('@mui/icons-material/Close', () => ({
  default: () => 'CloseIcon',
}));

// Dynamically import the Dashboard component after all mocks are set up.
// This ensures that the Dashboard uses our mocked modules.
const { default: Dashboard } = await import('../components/Dashboard/Dashboard.jsx');

// Global fetch mock to simulate API response for user authentication data.
// The fetch call in the Dashboard's useEffect will use this mock.
global.fetch = jest.fn((url) => {
  if (url === '/api/sets') {  //flashcardam
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  } else if (url === '/api/quizzes') {  //klausimam
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  } else if (url === '/api/auth/user') { //tam vienam autentifikavimo testui
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ username: 'TestUser' })
    });
  }
});


/**
 * ------------------------------------------------------------
 * Helper Functions
 * ------------------------------------------------------------
 */

// Helper function to render the Dashboard wrapped in MemoryRouter
// MemoryRouter provides the routing context required by the component.
const renderDashboard = async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  });
};

// Clear fetch mock calls before each test to ensure a clean slate
beforeEach(() => {
  fetch.mockClear();
});

/**
 * ------------------------------------------------------------
 * Test Suite for Dashboard Component
 * ------------------------------------------------------------
 */
describe('Dashboard', () => {
  // Test that the Dashboard renders and contains a "Create" button.
  test('renders the dashboard with create button', async () => {
    await renderDashboard();
    const createButton = screen.getByRole('button', { name: /create/i });
    expect(createButton).toBeInTheDocument();
  });

  // Test that clicking the "Create" button opens the set creator dialog.
  test('opens the set creator dialog when clicking create button', async () => {
    const user = userEvent.setup();
    await renderDashboard();

    const createButton = screen.getByRole('button', { name: /create/i });
      await user.click(createButton);

    // Wait for the dialog to open by checking for the input field with the placeholder.
    await waitFor(() => {
      const setNameInput = screen.getByPlaceholderText(/Name your set/i);
      expect(setNameInput).toBeInTheDocument();
    });
  });

  // Test that the Dashboard calls fetch on mount to retrieve user data.
  test('calls fetch on mount', async () => {
    await renderDashboard();
    expect(fetch).toHaveBeenCalledWith('/api/auth/user');
  });

  // Test that the Dashboard displays the logged-in username after a successful fetch.
  test('displays logged in username after successful fetch', async () => {
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Logged in as: TestUser/i)).toBeInTheDocument();
    });
  });

  // Test that when fetch fails, the Dashboard displays "Guest" as the user.
  test('displays Guest when fetch fails', async () => {
    // Force the fetch mock to simulate a failure.
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    await renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Guest/i)).toBeInTheDocument();
    });
  });

  // Test that the TopBar component is rendered inside the Dashboard.
  test('renders TopBar component', async () => {
    await renderDashboard();
    // Assuming TopBar has a test id 'topbar' set in its root element.
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
  });

  // Test that all the expected TopBar icons are rendered.
  test('renders TopBar icons', async () => {
    await renderDashboard();
    expect(screen.getByAltText('Home Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Search Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Logout Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Settings Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Profile Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Learn2 Icon')).toBeInTheDocument();
  });

  // Test that the set creator dialog closes when clicking the close icon.
  test('closes the set creator dialog when clicking the close icon', async () => {
    const user = userEvent.setup();
    await renderDashboard();

    // Open the dialog by clicking the "Create" button.
    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    // Wait for the dialog to open (check for the input field).
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Name your set/i)).toBeInTheDocument();
    });

    // Find the close icon (our mock renders "CloseIcon") and get its closest button.
    const closeIcon = screen.getByText(/CloseIcon/i);
    const closeButton = closeIcon.closest('button');
    await user.click(closeButton);

    // Confirm that the dialog is closed (the input should no longer be present).
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Name your set/i)).not.toBeInTheDocument();
    });
  });

  // Test that after providing the required inputs, the create button becomes enabled and triggers navigation.
  test('allows to press create button after prerequisites are met', async () => {
    const user = userEvent.setup();
    await renderDashboard();

    // Open the set creator dialog by clicking the "Create" button on the Dashboard.
    const dashboardCreateButton = screen.getByRole('button', { name: /create/i });
    await user.click(dashboardCreateButton);

    // Retrieve the mocked text field from the dialog.
    const textField = screen.getByPlaceholderText(/Name your set/i);

    // Locate the dialog element.
    const dialog = screen.getByRole('dialog');
    // Get the "Create" button within the dialog.
    const createButtonInDialog = within(dialog).getByRole('button', { name: /create/i });

    // Initially, the Create button should be disabled (no set name or type selected).
    expect(createButtonInDialog).toBeDisabled();

    // Type a set name into the text field.
    await user.type(textField, 'TestSet');

    // The Create button should still be disabled because no type has been selected.
    expect(createButtonInDialog).toBeDisabled();

    // Select a type option by clicking on the card labeled "Flashcard".
    await user.click(screen.getByText('Flashcard'));

    // Now that both prerequisites are met (name and type), the Create button should be enabled.
    expect(createButtonInDialog).not.toBeDisabled();

    // Click the Create button to trigger navigation.
    await user.click(createButtonInDialog);

    // Verify that navigation was triggered with the correct route.
    expect(mockNavigate).toHaveBeenCalledWith("/sets");
  });

  // Test that toggles the search input when the search icon is clicked.
  test('toggles search input on clicking the search icon', async () => {
    await renderDashboard();

    // Ensure that the search input is not visible before clicking the search icon.
    expect(screen.queryByPlaceholderText('Search…')).toBeNull();

    // Locate the search icon by its alt text and click it.
    const searchIcon = screen.getByAltText('Search Icon');
    await userEvent.click(searchIcon);

    // Verify that the search input now appears.
    const searchInput = await screen.findByPlaceholderText('Search…');
    expect(searchInput).toBeInTheDocument();

    // Simulate typing into the search input and verify the value.
    await userEvent.type(searchInput, 'Hello');
    expect(searchInput).toHaveValue('Hello');
  });
});
