import { refreshNewToken } from "../utils";
import type { PageServerLoad } from "./$types";
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/index';
export const load: PageServerLoad = async ({ cookies }) => {
    console.log('refresh token page server run');
    const patient_id = cookies.get('patient_id');
    const response = await refreshNewToken(patient_id);
    const auth = await prisma.auth.findMany({
        where: {
            patient_id: patient_id
        },
        select: {
            access_token: true,
            access_token_expiredAt: true
        }
    });
    redirect(302, '/');
}