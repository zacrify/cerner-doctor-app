import { refreshNewToken } from "../utils";
import type { PageServerLoad } from "./$types";
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/index';
import { patientId } from "../store";
export const load: PageServerLoad = async ({ cookies }) => {
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
    console.log('new refreshed token', auth[0].access_token);
    console.log('new expiredAt', auth[0].access_token_expiredAt);
    $patientId = patient_id;
    redirect(302, '/');
    // } else {
    //     redirect(302, '/');
    // }
}