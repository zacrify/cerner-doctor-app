
import prisma from '$lib/index';
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from './auth/$types';
import type { Actions } from './$types';

async function fetchVSWithToken(patient_id: string) {
    try {
        const auth = await prisma.auth.findMany({
            where: {
                patient_id: patient_id
            },
            select: {
                access_token: true,
                fhir_endpoint: true,
                patient_id: true
            }
        });
        const response = await fetch(`${auth[0].fhir_endpoint}/Observation?patient=${auth[0].patient_id}&category=vital-signs`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${auth[0].access_token}`,
                Accept: 'application/json'
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching vital signs:', error);
    }
}

export const load: PageServerLoad = async ( { cookies } ) => {
    const patient_id = cookies.get('patient_id');
    console.log('current patient at source page server:',patient_id)
    const response = await fetchVSWithToken(patient_id);
    const vsData = await response?.json();
    if (!response.ok) {
        // throw new Error('Error fetching vital signs: Please reopen from cerner site'); 
        console.log('resoise', response);
        redirect(302, '/refreshtoken');
    } else {
        // console.log('vsData:',vsData)
        return {
            vsData: vsData
        }
    }

}

async function createObservation(fhirServerUrl:string, accessToken:string, patientId:string, temp:number) {
    const observationData = {
        "resourceType": "Observation",
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "vital-signs",
                        "display": "Vital Signs"
                    }
                ],
                "text": "Vital Signs"
            }
        ],
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": "8331-1",
                    "display": "Oral temperature"
                }
            ],
            "text": "Temperature Oral"
        },
        "subject": {
            "reference": `Patient/${patientId}`
        },
        "effectiveDateTime": new Date().toISOString(), // Current date and time
        "valueQuantity": {
            "value": temp,
            "unit": "degC",
            "system": "http://unitsofmeasure.org",
            "code": "Cel"
        }
    };
    console.log('observationData:',JSON.stringify(observationData));
    try {
        const response = await fetch(`${fhirServerUrl}/Observation`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(observationData)
        });

        if (!response.ok) {
            throw new Error('Failed to create observation');
        }

        return;
    } catch (error) {
        console.error('Error creating observation:', error);
        throw error;
    }
}



export const actions: Actions = {
	selectpatient: async ({ cookies, request }) => {
		const data = await request.formData();
		const patient_id = data.get('patient');
        console.log('Actions patient_id:',patient_id)
		cookies.set('patient_id', patient_id, { path: '/', httpOnly: false});
        return { success: true };
	},
    submitvs: async ({ request, cookies }) => {
        const patient_id = cookies.get('patient_id');
        const auth = await prisma.auth.findMany({
            where: {
                patient_id: patient_id
            },
            select: {
                access_token: true,
                fhir_endpoint: true,
                patient_id: true
            }
        });
        const data = await request.formData();
        const temp = data.get('temp');
        const tempNumber = parseFloat(temp);
        console.log(typeof temp);
        await createObservation(auth[0].fhir_endpoint, auth[0].access_token, auth[0].patient_id, tempNumber);
        return { success: true };
    }
};