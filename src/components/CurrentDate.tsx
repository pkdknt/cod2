'use client';

import { useEffect, useState } from 'react';

/** Renders today's date on the client so it isn't frozen at build time. */
export default function CurrentDate() {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(new Date().toLocaleDateString('vi-VN'));
  }, []);

  return <>{text}</>;
}
