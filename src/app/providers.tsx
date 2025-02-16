'use client';
import { ChakraProvider } from "@chakra-ui/react";
import { system } from './theme';
import { AuthProvider } from './authProvider';
import { Header } from '@/component/header';
export function Providers({ children }: { children: React.ReactNode }) {
    return (
    <ChakraProvider value={system}>
        <AuthProvider>
        <Header />
        {children}
        </AuthProvider>
    </ChakraProvider>
    );
}