export const emailConfig = {
    // Default frontend URL for email verification
    frontendUrl:'http://192.168.1.190:8081',
    // Email verification timeout in milliseconds (24 hours)
    verificationTimeout: 24 * 60 * 60 * 1000,
    // Error messages
    messages: {
      verificationFailed: 'Failed to send email verification. Please try again later.',
      verificationExpired: 'The verification link has expired. Please request a new one.',
      verificationInvalid: 'The verification token is invalid. Please request a new one.',
      resendSuccess: 'A new verification email has been sent. Please check your inbox.',
      resendFailed: 'Failed to resend verification email. Please try again later.',
    },
  };
  