import { AuthUser, ALLOWED_DOMAIN } from '../types/auth';

// Extended mock authentication for testing domain validation
export const createTestAuthService = () => {
  const mockUsers = [
    {
      id: 'test-user-1',
      email: 'test.user@hippodigital.co.uk',
      name: 'Test User (Valid)',
      picture: undefined,
      domain: 'hippodigital.co.uk'
    },
    {
      id: 'test-user-2', 
      email: 'invalid.user@gmail.com',
      name: 'Invalid User',
      picture: undefined,
      domain: 'gmail.com'
    },
    {
      id: 'test-user-3',
      email: 'wrong.domain@hippo-digital.co.uk',
      name: 'Wrong Domain User', 
      picture: undefined,
      domain: 'hippo-digital.co.uk'
    }
  ];

  return {
    async testValidDomain(): Promise<AuthUser> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockUsers[0];
    },

    async testInvalidDomain(): Promise<AuthUser> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = mockUsers[1];
      throw new Error(`Access denied. Only ${ALLOWED_DOMAIN} email addresses are allowed.`);
    },

    async testWrongDomain(): Promise<AuthUser> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = mockUsers[2];
      throw new Error(`Access denied. Only ${ALLOWED_DOMAIN} email addresses are allowed.`);
    }
  };
};

export const testAuth = createTestAuthService();