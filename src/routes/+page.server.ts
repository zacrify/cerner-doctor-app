// import { PrismaClient } from '@prisma/client';
import type { Auth } from '@prisma/client';
import prisma from '$lib/index';
// import { page } from '$app/stores';

// const prisma = new PrismaClient();
let urlParams: URLSearchParams;

async function updateAuth(url) {
	const iss = url.searchParams.get('iss') || '';
	const launch = url.searchParams.get('launch') || '';
	const code = url.searchParams.get('code') || '';
	if (iss) {
        const authExist = await checkAuthIDExist(1);
        console.log('authExist&iss:',authExist);
		if (!authExist) {
			await prisma.auth.create({
		        data: {
                    id: 1,
		            fhir_endpoint: iss,
		            launch: launch
		        } as Auth
		    });
		}
		else {

		    await prisma.auth.update({
				where: { id: 1 },
				data: {
		            access_token: `AK${Math.floor(Math.random() * 10)}`,
					fhir_endpoint: iss,
					launch: launch
				} as Auth
			});
		}
	}
	if (code) {
        const authExist = await checkAuthIDExist(1);
        console.log('authExist&code:',authExist);
        if (!authExist) {
            
            await prisma.auth.create({
                data: {
                    id: 1,
                    code: code
                } as Auth
            });
        }
        else {
            await prisma.auth.update({
                where: { id: 1 },
                data: { code: code } as Auth
            });
        }
	}

}
async function checkAuthIDExist(myid: number) {
    const exist = await prisma.auth.count(
        {
          where: {
            id: myid
          }
        }
)
    return exist;
}

async function returnAuth() {
	const auths = await prisma.auth.findMany();
	return auths || [];
}

export async function load({ url }) {
	await updateAuth(url);

	return {
		post: await returnAuth(),
		url: url.href
	};
}
