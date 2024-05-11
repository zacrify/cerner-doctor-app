import type { PageServerLoad } from "./$types";
import prisma from '$lib/index';
import { redirect } from "@sveltejs/kit";
async function fetchVSWithToken() {
    try {
        const auth = await prisma.auth.findUnique({
            where: {
                id: 1
            },
            select: {
                access_token: true,
                fhir_endpoint: true,
                patient_id: true
            }
        });
        const response = await fetch(`${auth.fhir_endpoint}/Observation?patient=${auth.patient_id}&category=vital-signs`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${auth.access_token}`,
                Accept: 'application/json'
            }
        });
        // const filteredData = await response.json();
        // console.log('response',response);
        // return filteredData;
        return response;
    } catch (error) {
        console.error('Error fetching vital signs:', error);
    }
}

export const load: PageServerLoad = async ( { params } ) => {
    const response = await fetchVSWithToken();
    const vsData = await response.json();
    if (response.status !== 200) {
        // throw new Error('Error fetching vital signs: Please reopen from cerner site'); 
        redirect(302, '/refreshtoken');
    } else {
        // console.log('vsData:',vsData)
        return {
            vsData: vsData
        }
    }

}