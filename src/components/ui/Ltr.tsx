import React from 'react';

export const Ltr = ({ children }: { children: React.ReactNode }) => (
  <span dir="ltr" className="inline-block">{children}</span>
);
