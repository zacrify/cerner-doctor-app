import { redirect } from "@sveltejs/kit";
import { getNewToken } from "../utils";
import prisma from '$lib/index';

export async function load({ url }) {
	console.log('start from here');
	const auth = await prisma.auth.findUnique({
		where: { id: 1 },
		select: { access_token: true, access_token_expiredAt: true }
	});
	const now = Math.round(new Date().getTime() / 1000);
	const access_token = auth?.access_token;
    const access_token_expiredAt = auth?.access_token_expiredAt;
	if (!access_token) {
		console.log('no token');
		await getNewToken(url);
		console.log('get new token');
		// const patientData = await fetchPatient();
		redirect(302, '/');
	} else {
		if (now <= access_token_expiredAt) {
			console.log('token still valid');
			console.log('now:', now);
			console.log('expiredAt:', access_token_expiredAt);
			redirect(302, '/');
		} else {
			console.log('now:', now);
			console.log('redirect to refresh token');
			redirect(302, '/refreshtoken');
		}
	}
}
