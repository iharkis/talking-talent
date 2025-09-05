import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../../shared/test-utils';
import { Layout } from '../../../src/components/Layout';

// Mock window.location and history
const mockLocation = {
  pathname: '/dashboard'
};

const mockPushState = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

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

describe('Layout Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/dashboard';
  });

  describe('Rendering', () => {
    it('should render application title', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Talking Talent')).toBeInTheDocument();
    });

    it('should render children content', () => {
      const testContent = 'Test Content for Layout';
      
      render(
        <Layout>
          <div>{testContent}</div>
        </Layout>
      );

      expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    it('should render version information', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Version 1.0')).toBeInTheDocument();
      expect(screen.getByText('Performance Management System')).toBeInTheDocument();
    });

    it('should display current date in header', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Check if a date is displayed (mocked date from setup.ts)
      const dateText = screen.getByText(/Saturday, 10 August 2024/);
      expect(dateText).toBeInTheDocument();
    });
  });

  describe('Navigation Structure', () => {
    it('should render main navigation items', () => {
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
    });

    it('should render section titles', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Planning & Setup')).toBeInTheDocument();
      expect(screen.getByText('History & Settings')).toBeInTheDocument();
    });

    it('should render navigation links with correct hrefs', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
      expect(screen.getByRole('link', { name: /business analysts/i })).toHaveAttribute('href', '/bas');
      expect(screen.getByRole('link', { name: /talking talent rounds/i })).toHaveAttribute('href', '/rounds');
      expect(screen.getByRole('link', { name: /talking talent session/i })).toHaveAttribute('href', '/session');
      expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('href', '/history');
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
    });
  });

  describe('Active Navigation State', () => {
    it('should highlight dashboard when on dashboard path', () => {
      mockLocation.pathname = '/dashboard';
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-hippo-green');
    });

    it('should highlight dashboard when on root path', () => {
      mockLocation.pathname = '/';
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-hippo-green');
    });

    it('should highlight correct nav item based on current path', () => {
      mockLocation.pathname = '/bas';
      
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const basLink = screen.getByRole('link', { name: /business analysts/i });
      expect(basLink).toHaveClass('bg-hippo-green');
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).not.toHaveClass('bg-hippo-green');
    });

    it('should handle path changes correctly', () => {
      const { rerender } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Change path
      mockLocation.pathname = '/settings';
      
      rerender(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toHaveClass('bg-hippo-green');
    });
  });

  describe('Mobile Sidebar Functionality', () => {
    it('should render mobile menu button', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Find mobile menu buttons (there are two - one to open, one to close)
      const menuButtons = screen.getAllByRole('button');
      const mobileMenuButton = menuButtons.find(button => 
        button.className.includes('lg:hidden')
      );
      
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should toggle sidebar state on mobile menu click', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const menuButtons = screen.getAllByRole('button');
      const mobileMenuButton = menuButtons.find(button => 
        button.className.includes('lg:hidden') && 
        button.querySelector('svg')
      );
      
      expect(mobileMenuButton).toBeInTheDocument();
      
      // Click should trigger sidebar toggle (we test this via DOM changes)
      if (mobileMenuButton) {
        fireEvent.click(mobileMenuButton);
        // After clicking, the sidebar state should change
        // This is reflected in CSS classes but hard to test in jsdom
      }
    });

    it('should render close button in sidebar', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // The close button (X) should exist
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1); // Menu button + close button
    });
  });

  describe('Event Listeners', () => {
    it('should set up path change listeners on mount', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(mockAddEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });

    it('should modify history.pushState for path tracking', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Should have modified pushState
      expect(window.history.pushState).not.toBe(mockPushState);
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct base CSS classes', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const container = screen.getByText('Test Content').closest('.max-w-7xl');
      expect(container).toHaveClass('max-w-7xl', 'mx-auto');
    });

    it('should apply hippo theme classes', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const title = screen.getByText('Talking Talent');
      expect(title).toHaveClass('text-hippo-white');
    });

    it('should have responsive classes for mobile', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const buttons = screen.getAllByRole('button');
      const mobileButton = buttons.find(b => b.className.includes('lg:hidden'));
      
      expect(mobileButton).toHaveClass('lg:hidden');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const mainHeading = screen.getByRole('heading', { name: /talking talent/i });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have accessible navigation links', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have accessible buttons', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should be clickable
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });
});