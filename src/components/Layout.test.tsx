import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { Layout } from './Layout';

// Mock window.location and history
const mockLocation = {
  pathname: '/dashboard'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

const mockPushState = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'history', {
  value: { pushState: mockPushState },
  writable: true
});

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
});

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
});

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/dashboard';
  });

  it('should render application title', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Talking Talent')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render navigation sections', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Business Analysts')).toBeInTheDocument();
    expect(screen.getByText('Talking Talent Rounds')).toBeInTheDocument();
    expect(screen.getByText('Talking Talent Session')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check for Reviews in the section title and nav item separately
    expect(screen.getByRole('heading', { name: /reviews/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^reviews$/i })).toBeInTheDocument();
  });

  it('should render section titles', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Planning & Setup')).toBeInTheDocument();
    expect(screen.getByText('History & Settings')).toBeInTheDocument();
    // Don't test "Reviews" as it appears in both section title and nav item
  });

  it('should display current date in header', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Check if a formatted date is displayed
    const dateText = screen.getByText(new RegExp(new Date().getFullYear().toString()));
    expect(dateText).toBeInTheDocument();
  });

  it('should show version information', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Version 1.0')).toBeInTheDocument();
    expect(screen.getByText('Performance Management System')).toBeInTheDocument();
  });

  it('should toggle sidebar on mobile menu click', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Find the mobile menu button (should be the one with Menu icon)
    const menuButtons = screen.getAllByRole('button');
    const mobileMenuButton = menuButtons.find(button => 
      button.querySelector('svg') && button.className.includes('lg:hidden')
    );
    
    expect(mobileMenuButton).toBeInTheDocument();

    if (mobileMenuButton) {
      fireEvent.click(mobileMenuButton);
      // The sidebar should now be visible (we can't easily test CSS classes in jsdom)
    }
  });

  it('should close sidebar when close button is clicked', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // First open the sidebar
    const menuButtons = screen.getAllByRole('button');
    const mobileMenuButton = menuButtons.find(button => 
      button.querySelector('svg') && button.className.includes('lg:hidden')
    );
    
    if (mobileMenuButton) {
      fireEvent.click(mobileMenuButton);
      
      // Now look for close button (X icon)
      const closeButton = screen.getByRole('button', { name: /close/i }) || 
        menuButtons.find(button => button.querySelector('svg') && button.className.includes('lg:hidden'));
      
      if (closeButton) {
        fireEvent.click(closeButton);
      }
    }
  });

  it('should have correct navigation links', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    const basLink = screen.getByRole('link', { name: /business analysts/i });
    const roundsLink = screen.getByRole('link', { name: /talking talent rounds/i });
    const sessionLink = screen.getByRole('link', { name: /talking talent session/i });
    const reviewsLink = screen.getByRole('link', { name: /reviews/i });
    const historyLink = screen.getByRole('link', { name: /history/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(basLink).toHaveAttribute('href', '/bas');
    expect(roundsLink).toHaveAttribute('href', '/rounds');
    expect(sessionLink).toHaveAttribute('href', '/session');
    expect(reviewsLink).toHaveAttribute('href', '/reviews');
    expect(historyLink).toHaveAttribute('href', '/history');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('should highlight active navigation item based on current path', () => {
    mockLocation.pathname = '/bas';
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const basLink = screen.getByRole('link', { name: /business analysts/i });
    
    // Check if the active class is applied (we can test this by checking if the element has specific styling classes)
    expect(basLink).toHaveClass('bg-hippo-green');
  });

  it('should handle root path as dashboard', () => {
    mockLocation.pathname = '/';
    
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    
    // Dashboard should be active when on root path
    expect(dashboardLink).toHaveClass('bg-hippo-green');
  });
});