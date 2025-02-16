'use client';
import { auth } from '@/lib/firebase';
import { Box, Button, createToaster, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from "firebase/auth";

const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

export default function MypageContent() {
  const [loginUser, setUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/') // ログインページへ遷移
      }else{
        setUser(user);
        console.log(user);
        const idToken = await user.getIdToken();
        console.log('idToken::', idToken);
      }
    })
    return () => unsubscribe();
  }, [router])

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
        toaster.create({
        title: 'エラー',
        description: 'ログアウトに失敗しました'+error,
        duration: 5000,
      });
    }
  };


  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh">
      <Heading size="lg">マイページ</Heading>
      <Box>
        <Text fontSize="lg">
          ようこそ、{loginUser?.displayName || 'ゲスト'}さん
        </Text>
        <Text color="gray.600">Eメール:{loginUser?.email}</Text>
        <Text color="gray.600">ユーザーID:{loginUser?.uid}</Text>
      </Box>
      <Button colorScheme="red" onClick={handleLogout}>
          ログアウト
      </Button>
    </Box>
  )
}