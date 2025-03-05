'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

export default function LineCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.error('Authorization code not found');
      // router.push('/');
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
        await signInWithCustomToken(auth, customToken);
        console.log('signInWithCustomToken', customToken);

        let redirectUri = '/mypage';
        if (state) {
          const customData = JSON.parse(decodeURIComponent(state));
          redirectUri = customData.redirectUri;
        }
        console.log('redirectUri', redirectUri);

        // ログインできるとマイページへリダイレクト
        router.push(redirectUri)
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