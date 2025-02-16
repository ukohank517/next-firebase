'use client';
import { auth, googleProvider } from '@/lib/firebase';
import { Box, Button, createToaster, Heading } from '@chakra-ui/react';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

export default function Content() {
  const router = useRouter();

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

  const handleAppleClick = () => {
    console.log("apple");
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh">
      <Heading as="h1" size="xl" fontWeight="bold">
        ログインページ
      </Heading>
      <Button
        onClick={handleGoogleClick}
        colorScheme="blue"
        size="lg"
        mt={4}
      >
        Google でログイン
      </Button>
      <Button
        onClick={handleAppleClick}
        colorScheme="blackAlpha"
        size="lg"
        mt={4}
      >
        Apple でログイン
      </Button>
    </Box>
  );
}
