import { redirect } from "@sveltejs/kit";
import { getNewToken, fetchPatient } from "../utils";


export async function load({ url, cookies }) {
	await getNewToken(url,cookies);

	console.log('get new token');

	//newly added 
	const patient_id = cookies.get('patient_id');
	const patientData = await fetchPatient(patient_id);
	console.log('fetch patient has been called');

	redirect(302, '/');

}