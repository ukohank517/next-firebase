import MypageContent from '@/component/mypage';
import { authOptions } from '@/lib/nextauth';
import { getServerSession, User } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Mypage() {
  const session = await getServerSession(authOptions)
  const loginUser= session?.user;

  // ログイン情報がなければloginページに遷移
  if (!loginUser) {
    redirect('/')
  }

  return (
    <MypageContent loginUser={loginUser as User}/>
  )
}