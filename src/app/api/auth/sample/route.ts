import { adminApp } from '@/lib/firebase-admin';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';

// http://localhost:3000/api/auth/sample
export async function GET(req: Request) {

  const authHeader = req.headers.get('Authorization');
  console.log(authHeader);

  // 認証ヘッダーがない場合は401エラーを返す
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const auth = getAuth(adminApp);
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);

    return NextResponse.json({ message: 'your user id is ' + decodedToken.uid });
  } catch (error: any){
    return NextResponse.json({ error: 'Invalid or expired token', details: error.message }, { status: 403 });
  }
}