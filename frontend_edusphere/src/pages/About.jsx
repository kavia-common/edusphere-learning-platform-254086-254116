import React from 'react';

/**
 * PUBLIC_INTERFACE
 * About page to demonstrate routing and feature flags.
 */
export function About({ experiments }) {
  return (
    <div>
      <h1>About EduSphere</h1>
      <p>EduSphere is a cutting-edge Learning Management System.</p>
      <p><strong>Experiments enabled:</strong> {experiments ? 'Yes' : 'No'}</p>
    </div>
  );
}
