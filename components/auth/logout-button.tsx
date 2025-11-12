'use client';

import { Button, ButtonProps } from '@/components/ui/button';

interface LogoutButtonProps extends ButtonProps {}

export function LogoutButton({ onClick, ...props }: LogoutButtonProps) {
  const handleClick = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return <Button {...props} onClick={onClick ?? handleClick} />;
}
