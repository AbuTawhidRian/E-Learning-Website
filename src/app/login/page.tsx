import LoginForm from './LoginForm';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getAuthUser();
  if (user) {
    redirect(`/dashboard/${user.role.toLowerCase()}`);
  }
  return <LoginForm />;
}
