import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import DiscordProvider from 'next-auth/providers/discord';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import prisma from '@/app/libs/prismadb';

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_ID as string,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {label: 'email', type: 'text'},
                password: {label: 'password', type: 'password'},
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Sai thông tin tài khoản');
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    }
                })

                if (!user || !user?.hashedPassword) {
                    throw new Error('Sai thông tin tài khoản');
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                )

                if (!isCorrectPassword) {
                    throw new Error('Sai thông tin tài khoản');
                }

                return user;
            }
        })
    ],
    debug: process.env.NODE_ENV == 'development',
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };