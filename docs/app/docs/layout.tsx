import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: <div className='flex items-center'>
          <img src="/favicon.ico" alt="TezX" width="32" height="32" />
          <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>TezX</span>
        </div>
      }}
      githubUrl='https://github.com/tezxjs/TezX'
    >
      {children}
    </DocsLayout>
  );
}
