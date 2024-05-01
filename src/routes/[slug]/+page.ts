import { error } from '@sveltejs/kit';
import axios from 'axios';
/** @type {import('./$types').PageLoad} */ 
export async function load({ params }) {
	if (params.slug === 'slug1') {
		
		return { title: 'Hello world!', content: 'Welcome to our blog. Lorem ipsum dolor sit amet...' };
	}
	error(404, 'Not found');
}

let sourceData = {patient: {}};
async function fetchPatientWithToken() {
	try {
		const response = await axios.get(
			`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${localStorage.getItem(PATIENT_ID_LOCAL_STORAGE_KEY)}`,
			{
				headers: {
					Authorization: `Bearer ${localStorage.getItem('access_token')}`
				}
			}
		);
		console.log('Patient Data:', response.data.name[0].text);
		// localStorage.setItem('responsePatient', JSON.stringify(response.data)); // delete this line
		// $patientData = response.data; // delete this line
		sourceData.patient = {
			name: response.data.name[0].text,
			birthDate: response.data.birthDate,
			// age: calculateAge(response.data.birthDate),
			id: response.data.identifier[0].value,
			gender: response.data.gender
		};
	} catch (error) {
		console.error('Error fetching data:', error);
	}
}