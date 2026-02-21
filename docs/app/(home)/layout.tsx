import { HomeLayout } from 'fumadocs-ui/layouts/home';

export default function Layout({ children }: LayoutProps<'/'>) {
  return <HomeLayout
    links={[
      {
        text: "Blog",
        url: "/blogs"
      },
      {
        text: "Docs",
        url: "/docs"
      }
    ]}
    nav={{
      title: <div className='flex items-center'>
        <img src="/favicon.ico" alt="TezX" width="32" height="32" />
        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>TezX</span>
      </div>
    }}
    githubUrl='https://github.com/tezxjs/TezX'
  >
    {children}
  </HomeLayout>;
}
