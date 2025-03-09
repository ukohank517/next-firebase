'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

import { signIn as signInWithNextAuth } from 'next-auth/react';

export default function LineCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.error('Authorization code not found');
      return;
    }

    const getLineTokenAndSignIn = async () => {
      try {
        // LINE認証コードを使用してバックエンドでアクセストークンを取得
        const response = await fetch('/api/line/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Failed to get LINE token');
        }

        const { customToken } = await response.json();

        // Firebaseでカスタムトークンを使用して認証
        const userCredential = await signInWithCustomToken(auth, customToken);
        const firebaseUser = userCredential.user;
        const idToken = await firebaseUser.getIdToken();
        const refreshToken = firebaseUser.refreshToken;

        let redirectUri = '/mypage';
        if (state) {
          const customData = JSON.parse(decodeURIComponent(state));
          redirectUri = customData.redirectUri;
        }

        await signInWithNextAuth('credentials', {
          idToken,
          refreshToken,
          callbackUrl: redirectUri,
        });
      } catch (error) {
        console.error('Authentication error:', error);
        // router.push('/?error=auth_failed');
      }
    };

    getLineTokenAndSignIn();
  }, [searchParams, router]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh">
      <Spinner size="xl" />
      <Text mt={4}>LINEで認証中...</Text>
    </Box>
  );
}