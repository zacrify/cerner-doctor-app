import { refreshNewToken } from "../utils";
import type { PageServerLoad } from "./$types";
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/index';
export const load: PageServerLoad = async ({ params }) => {
    // const authData = await prisma.auth.findUnique({
    //     where: {
    //         id: 1
    //     },
    //     select: {
    //         access_token_expiredAt: true
    //     }
    // });
    // const now = Math.round(new Date().getTime() / 1000);

    // if (now > authData.access_token_expiredAt) {
    const response = await refreshNewToken();
    const auth = await prisma.auth.findUnique({
        where: {
            id: 1
        },
        select: {
            access_token: true,
            access_token_expiredAt: true
        }
    });
    console.log('new refreshed token', auth.access_token);
    console.log('new expiredAt', auth.access_token_expiredAt);
    redirect(302, '/');
    // } else {
    //     redirect(302, '/');
    // }
}