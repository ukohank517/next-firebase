'use client';
import { ChakraProvider } from "@chakra-ui/react";
import { system } from './theme';
import { SessionProvider } from 'next-auth/react';
import { Header } from '@/component/header';
export function Providers({ children }: { children: React.ReactNode }) {
    return (
    <ChakraProvider value={system}>
        <SessionProvider>
            <Header />
            {children}
        </SessionProvider>
    </ChakraProvider>
    );
}