// Testes do Skeleton - Sem imports do vitest (usando globals)

import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonList, SkeletonTable } from '../Skeleton';

describe('Skeleton', () => {
  it('deve renderizar skeleton básico', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-muted');
  });

  it('deve renderizar skeleton com variante text', () => {
    render(<Skeleton variant="text" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveClass('rounded', 'h-4');
  });

  it('deve renderizar skeleton com variante circular', () => {
    render(<Skeleton variant="circular" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('deve renderizar skeleton com largura e altura personalizadas', () => {
    render(<Skeleton width={200} height={100} />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
  });

  it('deve renderizar skeleton com largura em string', () => {
    render(<Skeleton width="60%" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveStyle({ width: '60%' });
  });

  it('deve renderizar skeleton com animação pulse', () => {
    render(<Skeleton animation="pulse" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('deve renderizar skeleton com animação shimmer', () => {
    render(<Skeleton animation="wave" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveClass('animate-shimmer');
  });

  it('deve renderizar skeleton sem animação', () => {
    render(<Skeleton animation={false} />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).not.toHaveClass('animate-pulse', 'animate-shimmer');
  });
});

describe('SkeletonCard', () => {
  it('deve renderizar skeleton de card', () => {
    render(<SkeletonCard />);
    
    // Deve ter pelo menos 3 skeletons
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});

describe('SkeletonList', () => {
  it('deve renderizar lista com 5 itens por padrão', () => {
    render(<SkeletonList />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons.length).toBeGreaterThanOrEqual(15); // 5 itens x 3 skeletons cada
  });

  it('deve renderizar lista com número customizado de itens', () => {
    render(<SkeletonList count={3} />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons.length).toBeGreaterThanOrEqual(9); // 3 itens x 3 skeletons cada
  });
});

describe('SkeletonTable', () => {
  it('deve renderizar tabela com 5 linhas por padrão', () => {
    render(<SkeletonTable />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons.length).toBeGreaterThanOrEqual(16); // header + 5 rows x 3 columns
  });

  it('deve renderizar tabela com número customizado de linhas', () => {
    render(<SkeletonTable rows={3} />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons.length).toBeGreaterThanOrEqual(10); // header + 3 rows x 3 columns
  });
});
