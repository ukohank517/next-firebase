import { adminApp } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/nextauth';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// http://localhost:3000/api/auth/sample
export async function GET(req: Request) {

  const session = await getServerSession(authOptions);
  const idToken = session!.user.idToken as string;
  if(!idToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const auth = getAuth(adminApp);
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);

    return NextResponse.json({ message: 'your user id is ' + decodedToken.uid });
  } catch (error: any){
    return NextResponse.json({ error: 'Invalid or expired token', details: error.message }, { status: 403 });
  }
}