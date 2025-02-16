'use client';
import { Box, Button, Heading } from '@chakra-ui/react';

export default function Content() {
  const handleGoogleClick = () => {
    console.log("google");
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
