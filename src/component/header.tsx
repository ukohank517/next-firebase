'use client';
import { chakra, Container, Heading } from '@chakra-ui/react'
import { useSession } from 'next-auth/react';

export const Header = () => {
  const { status, data } = useSession()

  return (
    <chakra.header py={4} bgColor={'blue.600'}>
      <Container maxW={'container.lg'}>
         <Heading color={'white'}>
            {status === 'loading' && 'Loading...'}
            {status === 'unauthenticated' && 'Please login'}
            {status === 'authenticated' && 'welcome, ' + data.user.name }
          </Heading>
      </Container>
    </chakra.header>
  )
}