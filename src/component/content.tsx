'use client';
import { auth, handleAppleLoginRedirect, handleGoogleLoginPopup, handleGoogleLoginRedirect } from '@/lib/firebase';
import { Box, Button, createToaster, Heading, Link, Text } from '@chakra-ui/react';
import { getRedirectResult } from 'firebase/auth';
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

  // google, apple がリダイレクト後の処理はここ
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

  const lang = "ja"; // 言語指定(ja, en)

  const customData = {
    redirectUri: `/mypage?hoge=fuga`,
  }
  const state = encodeURIComponent(JSON.stringify(customData));

  const lineLoginHref = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CHANNEL_ID}&redirect_uri=${process.env.NEXT_PUBLIC_LINE_CALLBACK_URL}&state=${state}&bot_prompt=normal&scope=profile%20openid%20email&nonce=foobar&ui_locales=${lang}`

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh">
      <Heading as="h1" size="xl" fontWeight="bold">
        ログインページ
      </Heading>
      <Text>参考資料(googleLoginについて): https://firebase.google.com/docs/auth/web/google-signin?hl=ja</Text>
      <Text>参考資料(signInWithRedirectのベストプラクティス): https://firebase.google.com/docs/auth/web/redirect-best-practices?hl=ja</Text>
      <Button
        colorScheme="blue"
        size="lg"
        mt={4}
      >
        <Link color={'white'} href={lineLoginHref}>LINEでログイン(redirect)</Link>
      </Button>
      <Button
        onClick={handleGoogleLoginRedirect}
        colorScheme="blue"
        size="lg"
        mt={4}
      >
        Google でログイン(redirect)
      </Button>
      <Button
        onClick={() => handleGoogleLoginPopup(router, toaster)}
        colorScheme="blue"
        size="lg"
        mt={4}
      >
        Google でログイン(popup)
      </Button>
      <Button
        onClick={handleAppleLoginRedirect}
        colorScheme="blackAlpha"
        size="lg"
        mt={4}
      >
        Apple でログイン(redirect)
      </Button>
    </Box>
  );
}
