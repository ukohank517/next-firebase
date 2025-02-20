'use client';
import { appleProvider, auth, googleProvider } from '@/lib/firebase';
import { Box, Button, createToaster, Heading, Text } from '@chakra-ui/react';
import { getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// memo:
// https://firebase.google.com/docs/auth/web/apple?hl=ja&_gl=1*166sfd8*_up*MQ..*_ga*Mjk3NTk0ODg0LjE3Mzk3MTM1ODE.*_ga_CW55HF8NVT*MTczOTcxMzU4MC4xLjAuMTczOTcxNDEyNC4wLjAuMA..

const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

export default function Content() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("SSR, ignore");
      return; // SSR を防ぐ
    }

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("ログイン成功:", result.user);
          router.push('/mypage')
        }else {
          console.log("ログイン情報なし");
        }
      })
      .catch((error) => {
        console.error(error);
        toaster.create({
          title: 'login error',
          description: 'ログインに失敗しました',
          duration: 5000,
        })
      });

  }, []);


  const handleGoogleClickRedirect = async () => {
    console.log("google");
    auth.languageCode = "en"; // 言語指定はここで行う
    signInWithRedirect(auth, googleProvider);
  }

  const handleGoogleClick = async () => {
    console.log("google");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if(result.user) {
        router.push('/mypage')
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        title: 'login error',
        description: 'ログインに失敗しました',
        duration: 5000,
      })
    }
  }

  const handleAppleClick = async () => {
    console.log("apple");
    try {
      const result = await signInWithPopup(auth, appleProvider);
      if(result.user) {
        router.push('/mypage')
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        title: 'login error',
        description: 'ログインに失敗しました',
        duration: 5000,
      })
    }
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh">
      <Heading as="h1" size="xl" fontWeight="bold">
        ログインページ
      </Heading>
      <Text>参考資料(googleLoginについて): https://firebase.google.com/docs/auth/web/google-signin?hl=ja</Text>
      <Text>参考資料(signInWithRedirectのベストプラクティス): https://firebase.google.com/docs/auth/web/redirect-best-practices?hl=ja</Text>
      <Button
        onClick={handleGoogleClickRedirect}
        colorScheme="blue"
        size="lg"
        mt={4}
      >
        Google でログイン(redirect)
      </Button>
      <Button
        onClick={handleGoogleClick}
        colorScheme="blue"
        size="lg"
        mt={4}
      >
        Google でログイン(popup)
      </Button>
      <Button
        onClick={handleAppleClick}
        colorScheme="blackAlpha"
        size="lg"
        mt={4}
      >
        Apple でログイン(popup)
      </Button>
    </Box>
  );
}
