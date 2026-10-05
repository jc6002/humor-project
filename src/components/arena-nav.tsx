import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
import {hasSupabaseEnv} from '@/lib/supabase/env';
export async function ArenaNav() {
  const db=hasSupabaseEnv()?await createClient():null;
  const user=db?(await db.auth.getUser()).data.user:null;
  return <header className="site-header"><Link href="/" className="brand"><span className="brand-mark">ai</span><span>joke arena<span className="brand-dot">.</span></span></Link><nav aria-label="Main navigation"><Link href="/">Rankings</Link><Link href="/arena">Battle</Link>{user&&<Link href="/my-battles">My battles</Link>}</nav>{user?<div className="account-actions"><Link className="avatar-link" href="/profile" aria-label="Your profile">{(user.email??'U').slice(0,1).toUpperCase()}</Link><form action="/auth/signout" method="post"><button className="text-button" type="submit">Sign out</button></form></div>:<Link className="button button-small" href="/auth/signin">Sign in ↗</Link>}</header>;
}
export function ArenaFooter(){return <footer className="site-footer"><span>AI writes. Humans decide.</span><span>The Humor Project · Week 4</span><a href="https://www.thehumorproject.org/assignment/29" target="_blank" rel="noreferrer">About this project ↗</a></footer>}
