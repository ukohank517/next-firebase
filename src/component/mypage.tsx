'use client';
import { auth, handleLogoutAccount } from '@/lib/firebase';
import { Box, Button, createToaster, Heading, HStack, Text } from '@chakra-ui/react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

export default function MypageContent({loginUser}:{loginUser: User}) {
  const router = useRouter();
  const { status, data } = useSession()

  const handleWithdraw = async () => {
    if (!loginUser) return;

    if (window.confirm('本当に退会しますか？この操作は取り消せません。')) {
      try {
        console.log('退会する処理をして〜〜〜〜〜〜〜〜〜〜〜〜');
        toaster.create({
          title: '退会完了',
          description: '退会処理が完了しました。ご利用ありがとうございました。',
          duration: 5000,
        });
        // router.push('/');
      } catch (error) {
        toaster.create({
          title: 'エラー',
          description: '退会処理に失敗しました。' + error,
          duration: 5000,
        });
      }
    }
  };

    const handleCallSampleAPI = async () => {
    try{
      console.log('サンプルAPIを呼び出します');
      const idToken = await auth.currentUser?.getIdToken(); // idTokenでサーバーにアクセス
      if (!idToken) throw new Error('ログインしていません');

      const response = await fetch('/api/auth/sample', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      toaster.create({
        title: 'error',
        description: 'エラーが発生しました。' + error,
        duration: 5000,
      })
    }


  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minH="100vh">
      <Heading size="lg">マイページ</Heading>
      <HStack>
      <Box>
        <Text fontSize="lg">【サーバー情報】</Text>
        <Text color="gray.600">ようこそ、{loginUser?.name || 'ゲスト'}さん</Text>
        <Text color="gray.600">Eメール:{loginUser?.email}</Text>
        <Text color="gray.600">ユーザーID:{loginUser?.uid}</Text>
      </Box>
      <Box>
        <Text fontSize="lg">【クライアント情報】</Text>
        <Text color="gray.600">ようこそ、{data?.user.name || 'ゲスト'}さん</Text>
        <Text color="gray.600">Eメール:{data?.user.email}</Text>
        <Text color="gray.600">ユーザーID:{data?.user.uid}</Text>

      </Box>
      </HStack>
      <Box mt={4} display="flex" flexDirection="column" gap={2}>
        <Button colorScheme="blue" onClick={handleCallSampleAPI}>
          サーバー呼び出し
        </Button>
        <Button colorScheme="red" onClick={() => handleLogoutAccount(router, toaster)}>
          ログアウト
        </Button>
        <Button colorScheme="gray" onClick={handleWithdraw}>
          退会する
        </Button>
      </Box>
    </Box>
  )
}