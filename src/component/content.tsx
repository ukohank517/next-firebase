'use client';
import { firebaseAuth, getRedirectUri, redirectToAppleRedirectPage, redirectToGoogleLoginPage, loginAccount } from '@/lib/firebase';
import { Box, Button, createToaster, Heading, Link, Spinner, Text, VStack } from '@chakra-ui/react';
import { getRedirectResult } from 'firebase/auth';
import { useEffect, useState } from 'react';

// memo:
// https://firebase.google.com/docs/auth/web/apple?hl=ja&_gl=1*166sfd8*_up*MQ..*_ga*Mjk3NTk0ODg0LjE3Mzk3MTM1ODE.*_ga_CW55HF8NVT*MTczOTcxMzU4MC4xLjAuMTczOTcxNDEyNC4wLjAuMA..

const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

export default function Content() {
  const [loading, setLoading] = useState(false);

  // google, apple がリダイレクト後の処理はここ
  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("SSR, ignore");
      return; // SSR を防ぐ
    }
    setLoading(true);

    // google, apple ログイン成功後、このページに戻ってくる
    getRedirectResult(firebaseAuth)
      .then(async (result) => {
        if (result?.user) {
          const idToken = await result.user.getIdToken();
          const refreshToken = result.user.refreshToken;

          const redirectUri = getRedirectUri() || '/mypage';

          await loginAccount(idToken, refreshToken, redirectUri);
        }
      })
      .catch((error) => {
        console.error(error);
        toaster.create({
          title: 'login error',
          description: 'ログインに失敗しました',
          duration: 5000,
        })
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const lang = "ja"; // 言語指定(ja, en)

  const customData = {
    redirectUri: `/mypage?hoge=fuga`,
  }
  const state = encodeURIComponent(JSON.stringify(customData));

  const lineLoginHref = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CHANNEL_ID}&redirect_uri=${process.env.NEXT_PUBLIC_LINE_CALLBACK_URL}&state=${state}&bot_prompt=normal&scope=profile%20openid%20email&nonce=foobar&ui_locales=${lang}`

  return (
    <>
      {loading &&
        <VStack colorPalette="teal">
          <Spinner color="colorPalette.600" />
          <Text color="colorPalette.600">Loading...</Text>
        </VStack>
      }
      {!loading && <>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh">
          <Heading as="h1" size="xl" fontWeight="bold">
            ログインページ
          </Heading>
          <Text>参考資料(googleLoginについて): https://firebase.google.com/docs/auth/web/google-signin?hl=ja</Text>
          <Text>参考資料(signInWithRedirectのベストプラクティス): https://firebase.google.com/docs/auth/web/redirect-best-practices?hl=ja</Text>
          <Button colorScheme="blue" size="lg" mt={4}>
            <Link color={'white'} href={lineLoginHref}>LINEでログイン(redirect)</Link>
          </Button>
          <Button onClick={redirectToGoogleLoginPage} colorScheme="blue" size="lg" mt={4}>
            Google でログイン(redirect)
          </Button>
          <Button onClick={redirectToAppleRedirectPage} colorScheme="blackAlpha" size="lg" mt={4}>
            Apple でログイン(redirect)
          </Button>
        </Box>
      </>}
    </>
  );
}
