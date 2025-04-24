import { render, screen, fireEvent } from '@testing-library/react';

import { vi } from 'vitest';
import Button from '../button';

describe('Button', () => {
  it('renders a button', () => {
    render(<Button />);
    expect(screen.getByRole('button')).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
