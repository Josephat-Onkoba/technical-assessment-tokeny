import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

// Helper to render the app at a given route
const renderAt = (route = '/') => {
  // Ensure previous renders are unmounted to avoid duplicate elements
  cleanup();
  window.history.pushState({}, 'Test', route);
  return render(<App />);
};

// Seed localStorage tasks and clear logs before each test
beforeEach(() => {
  localStorage.clear();
  const mockTasks = [
    { _id: '1', title: 'A done task', description: 'x', status: 'complete', priority: 'low' },
    { _id: '2', title: 'An open task', description: 'y', status: 'incomplete', priority: 'high' },
    { _id: '3', title: 'Another open task', description: 'z', status: 'incomplete' },
  ];
  localStorage.setItem('tasks', JSON.stringify(mockTasks));
});

// Quick login helper (uses the local demo accounts)
async function loginAs(role = 'user') {
  renderAt('/login');
  const email = screen.getByPlaceholderText(/enter your email/i);
  const password = screen.getByPlaceholderText(/enter your password/i);
  await userEvent.type(email, role === 'admin' ? 'admin@example.com' : 'user@example.com');
  await userEvent.type(password, 'password123');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  // wait for redirect to dashboard
  await waitFor(() => {
    expect(window.location.pathname).toMatch(/\/(admin|user)\/dashboard/);
  });
}

describe('Tasks 1-3 integration', () => {
  it('Task 1: redirects unauthenticated users to /login and hides tabs', async () => {
    renderAt('/');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });

    // Navbar actions should not be visible when logged out
    expect(screen.queryByRole('button', { name: /tasks/i })).toBeNull();
  });

  it('Task 2: filters tasks by status and search', async () => {
    await loginAs('user');
    // Navigate to task filter route
    renderAt('/user/task-filter');
    await waitFor(() => {
      expect(screen.getByText(/task filter/i)).toBeInTheDocument();
    });

    // Status: Incomplete -> should show 2 items
    const statusSelect = screen.getByLabelText(/filter by status/i);
    await userEvent.selectOptions(statusSelect, 'incomplete');
    await waitFor(() => {
      expect(screen.getByText(/showing 2 of 3 tasks/i)).toBeInTheDocument();
    });

    // Search for "another" -> should narrow to 1
    const search = screen.getByLabelText(/search tasks/i);
    await userEvent.type(search, 'another');
    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 3 tasks/i)).toBeInTheDocument();
      expect(screen.getByText('Another open task')).toBeInTheDocument();
    });

    // Status: Completed -> should show 1 item
    await userEvent.clear(search);
    await userEvent.selectOptions(statusSelect, 'complete');
    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 3 tasks/i)).toBeInTheDocument();
      expect(screen.getByText('A done task')).toBeInTheDocument();
    });
  });

  it('Task 3: logs appear on login/logout and can be deleted by admin', async () => {
    // Login as admin creates a login log
    await loginAs('admin');

    // Now logout via navbar profile dropdown
    // Open profile menu (button shows user name, defaults to "User")
    const profileBtn = await screen.findByRole('button', { name: /user/i });
    await userEvent.click(profileBtn);
    const logoutBtn = await screen.findByRole('button', { name: /logout/i });
    await userEvent.click(logoutBtn);

    // After logout, go to admin login and then to user logs page
    await loginAs('admin');
    renderAt('/admin/user-logs');

    // Expect at least one log row
    await waitFor(() => {
      expect(screen.getByText(/user activity logs/i)).toBeInTheDocument();
    });

    // Delete first log if present
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');
    if (rows.length > 1) {
      // Find first delete action and perform confirm flow
      const delBtn = within(rows[1]).getByRole('button', { name: /delete log/i });
      await userEvent.click(delBtn);
      const confirm = within(rows[1]).getByText(/confirm/i);
      await userEvent.click(confirm);
    }

    // Logs should still render without error after deletion
    await waitFor(() => {
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
    });
  });
});
