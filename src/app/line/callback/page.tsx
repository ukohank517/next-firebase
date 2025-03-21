'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { firebaseAuth, loginAccount } from '@/lib/firebase-client';
import { signInWithCustomToken } from 'firebase/auth';

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
        const json = await response.json();

        if (!response.ok) {
          router.push(`/?error=${json.errorCode}`);
          return;
        }

        const customToken = json.customToken;

        // Firebaseでカスタムトークンを使用して認証
        const userCredential = await signInWithCustomToken(firebaseAuth, customToken);
        const firebaseUser = userCredential.user;
        const idToken = await firebaseUser.getIdToken();
        const refreshToken = firebaseUser.refreshToken;

        let redirectUri = '/mypage';
        if (state) {
          const customData = JSON.parse(decodeURIComponent(state));
          redirectUri = customData.redirectUri;
        }

        await loginAccount(idToken, refreshToken, redirectUri);
      } catch (error: unknown) {
        console.error(error);
        router.push(`/?error=UNKNOWN_ERROR`);
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