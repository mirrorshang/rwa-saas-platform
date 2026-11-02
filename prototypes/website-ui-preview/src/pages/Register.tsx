import { useEffect } from 'react';
import { entryPath } from '../authDemo';
import { paths } from '../config';

export function Register() {
  useEffect(() => { location.replace(entryPath(paths.login)); }, []);
  return <main className="login-page login-center"><p role="status">正在进入企业账户入口…</p></main>;
}
