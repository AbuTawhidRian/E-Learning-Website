import RegisterForm from './RegisterForm';
import { getAuthUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const user = await getAuthUser();
  if (user) {
    redirect(`/dashboard/${user.role.toLowerCase()}`);
  }
  return <RegisterForm />;
}
