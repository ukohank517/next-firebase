import { chakra, Container, Heading } from '@chakra-ui/react'

import { useAuthContext } from '@/app/authProvider'

export const Header = () => {
  const { user } = useAuthContext()

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
         <Heading color={'white'}>
           {user ? 'ログイン中' : 'ログアウト中'}
         </Heading>
      </Container>
    </chakra.header>
  )
}