
import axios from "axios";

export function calculateAge(birthdate: string) {
    if (!birthdate) {
        return null;
    } else {
        const birthdateArray = birthdate.split('-');
        const birthYear = parseInt(birthdateArray[0]);
        const birthMonth = parseInt(birthdateArray[1]);
        const birthDay = parseInt(birthdateArray[2]);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth() returns zero-based index
        const currentDay = currentDate.getDate();

        let age = currentYear - birthYear;

        // If the current month and day are less than the birth month and day, subtract 1 from age
        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
            age--;
        }

        return age;
    }
}

export function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1; // Months are zero-based, so add 1
    const year = date.getUTCFullYear();

    // Add leading zeros if needed
    const formattedDay = day < 10 ? "0" + day : day;
    const formattedMonth = month < 10 ? "0" + month : month;

    // Extract time components
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    // Format the date and time
    const formattedDateTime = `${formattedDay}/${formattedMonth}/${year} ${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
    
    return formattedDateTime;
  }


  export async function postObservationTemp(fhir_endpoint: string,token: string, patientid: string, temperature: number) {
      // Observation object
      const observation = {
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
              "reference": `Patient/${patientid}` // Replace with the patient reference
          },
          "effectiveDateTime": new Date().toISOString(), // Current date and time
          "valueQuantity": {
              "value": temperature,
              "unit": "degC",
              "system": "http://unitsofmeasure.org",
              "code": "Cel"
          }
      };
  
      // Axios POST request
      await postObservation(fhir_endpoint,token, patientid, observation);
  }
  

  export async function postObservationBP(fhir_endpoint: string,token: string, patientid: string, sbp: number, dbp: number) {
    // Observation object
    const observation = {
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
                    "code": "85354-9",
                    "display": "Blood pressure panel with all children optional"
                }
            ],
            "text": "Blood pressure"
        },
        "subject": {
            "reference": `Patient/${patientid}` // Replace with the patient reference
        },
        "effectiveDateTime": new Date().toISOString(), // Current date and time
        "component": [
            {
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "8480-6",
                            "display": "Systolic blood pressure"
                        }
                    ],
                    "text": "Systolic blood pressure"
                },
                "valueQuantity": {
                    "value": sbp,
                    "unit": "mm[Hg]",
                    "system": "http://unitsofmeasure.org",
                    "code": "mm[Hg]"
                }
            },
            {
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "8462-4",
                            "display": "Diastolic blood pressure"
                        }
                    ],
                    "text": "Diastolic blood pressure"
                },
                "valueQuantity": {
                    "value": dbp,
                    "unit": "mm[Hg]",
                    "system": "http://unitsofmeasure.org",
                    "code": "mm[Hg]"
                }
            }
        ]
    };
    await postObservation(fhir_endpoint,token, patientid, observation);
}


export async function postObservationRR(fhir_endpoint: string,token: string, patientid: string, rr: number) {
    // Observation object
    const observation = {
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
                    "code": "9279-1",
                    "display": "Respiratory rate"
                }
            ],
            "text": "Respiratory rate"
        },
        "subject": {
            "reference": `Patient/${patientid}` // Replace with the patient reference
        },
        "effectiveDateTime": new Date().toISOString(), // Current date and time
        "valueQuantity": {
            "value": rr,
            "unit": "br/min",
            "system": "http://unitsofmeasure.org",
            "code": "/min"
        }
    };
    await postObservation(fhir_endpoint,token, patientid, observation);
}


export async function postObservationPR(fhir_endpoint: string,token: string, patientid: string, pr: number) {
    // Observation object
    const observation = {
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
                    "code": "69000-8",
                    "display": "Heart rate --sitting"
                }
            ],
            "text": "Heart rate"
        },
        "subject": {
            "reference": `Patient/${patientid}` // Replace with the patient reference
        },
        "effectiveDateTime": new Date().toISOString(), // Current date and time
        "valueQuantity": {
            "value": pr,
            "unit": "br/min",
            "system": "http://unitsofmeasure.org",
            "code": "/min"
        }
    };
    await postObservation(fhir_endpoint,token, patientid, observation);
}

async function postObservation(fhir_endpoint: string,token: string, patientid: string, observation: any) {
    // Axios POST request
    try {
        const response = await axios.post(`${fhir_endpoint}/Observation`, observation, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json',
                
            }
        });
        console.log('Observation posted successfully:', response.data);
    } catch (error) {
        console.error('Error posting Observation:', error);
    }
}