import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Simple page informing users to verify their email.
 */
export function VerifyEmail() {
  return (
    <div>
      <h1>Verify your email</h1>
      <p>We sent a verification link to your email address. Please open it to activate your account.</p>
      <p>If you did not receive an email, please check your spam folder or try again later.</p>
    </div>
  );
}
