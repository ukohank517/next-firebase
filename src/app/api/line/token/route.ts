import { NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { adminApp } from '@/lib/firebase-admin';

// Firebase Adminの初期化確認
if (!adminApp) {
  throw new Error('Firebase Admin is not initialized');
}

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
        client_secret: process.env.NEXT_PUBLIC_LINE_CHANNEL_SECRET!, // TODO: make this private
      }),
    });

    if (tokenResponse.status !== 200) {
      throw new Error('Failed to get LINE access token');
    }

    // 取得できるのはaccess_token, refresh_token, expires_in, id_token
    const { access_token, id_token } = await tokenResponse.json();

    // id_tokenをデコードして中身を確認
    const decodedIdToken = decodeJwt(id_token);
    // TODO: decodedIdToken.emailがなければログアウト

    // LINEプロフィール情報を取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get LINE profile');
    }

    const profile = await profileResponse.json();

    // Firebaseカスタムトークンを生成
    // メモ: google, appleのフォーマットに合わせる
    const customToken = await auth().createCustomToken(profile.userId, {
      firebase: {
        identities: {
          line: {
            userId: profile.userId,
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            email: decodedIdToken.email,
          },
        },
      },
    });

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}