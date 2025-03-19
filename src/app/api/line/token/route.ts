import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';

// JWT decoding function (without verification)
function decodeJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    // LINEのアクセストークンを取得
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_LINE_CALLBACK_URL!,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    });

    // 取得できるのはaccess_token, refresh_token, expires_in, id_token
    const { access_token, id_token } = await tokenResponse.json();

    // id_tokenをデコードして中身を確認
    const decodedIdToken = decodeJwt(id_token);

    // LINEプロフィール情報を取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let errorCode = ''
    if (!decodedIdToken.email) {
      errorCode = 'LINE_NO_MAIL'
    } else if (!profileResponse.ok) {
      errorCode = 'LINE_FAIL_PROFILE'
    }

    if(errorCode !== '') {
      return NextResponse.json({
        error: 'authorization error',
        errorCode: errorCode
      }, { status: 400 });
    }

    const profile = await profileResponse.json();

    // Firebaseカスタムトークンを生成
    // ここは、google, appleのフォーマットに合わせることができない
    const customToken = await auth().createCustomToken(profile.userId, {
      customIdentities: {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        email: decodedIdToken.email,
      },
    });

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        errorCode: 'UNKNOWN',
      },
      { status: 500 }
    );
  }
}