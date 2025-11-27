import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper, Button } from "@mui/material";

import patientsService from "../services/patients";
import { Patient, Gender, Diagnosis } from "../types";
import EntryDetails from "./EntryDetails";

interface Props {
    diagnoses: Diagnosis[];
}

type EntryType = "HealthCheck" | "Hospital" | "OccupationalHealthcare";

const PatientPage = ({ diagnoses }: Props) => {
    const { id } = useParams<{ id: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [showForm, setShowForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [entryType, setEntryType] = useState<EntryType>("HealthCheck");


    useEffect(() => {
        const fetchPatient = async () => {
            try {
                if (!id) {
                    setError("No patient id provided");
                    setLoading(false);
                    return;
                }
                const data = await patientsService.getById(id);
                setPatient(data);
            } catch (e) {
                console.error(e);
                setError("Could not fetch patient data");
            } finally {
                setLoading(false);
            }
        };

        void fetchPatient();
    }, [id]);

    const genderSymbol = (gender: Gender) => {
        switch (gender) {
            case Gender.Male:
                return "♂️";
            case Gender.Female:
                return "♀️";
            case Gender.Other:
                return "⚧";
            default:
                return "";
        }
    };

    if (loading) {
        return (
            <Box mt={2}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box mt={2}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!patient) {
        return (
            <Box mt={2}>
                <Typography>No patient found.</Typography>
            </Box>
        );
    }

    return (
        <Box mt={2}>
            <Paper style={{ padding: "1rem" }}>
                <Typography variant="h5" gutterBottom>
                    {patient.name} {genderSymbol(patient.gender)}
                </Typography>
                <Typography>SSN: {patient.ssn}</Typography>
                <Typography>Occupation: {patient.occupation}</Typography>

                <Box mt={2} mb={2}>
                    <Button variant="contained" onClick={() => setShowForm(!showForm)}>
                        Add New Entry
                    </Button>

                    {errorMessage && (
                        <Box mt={1}>
                            <Typography color="error">{errorMessage}</Typography>
                        </Box>
                    )}

                    {showForm && (
                        <Box mt={2} p={2} border="1px dashed gray">
                            <Typography variant="h6">New HealthCheck entry</Typography>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target as any;

                                    const baseEntry: any = {
                                        type: entryType,
                                        description: form.description.value,
                                        date: form.date.value,
                                        specialist: form.specialist.value,
                                        diagnosisCodes: form.diagnosisCodes.value
                                            ? form.diagnosisCodes.value
                                                .split(",")
                                                .map((s: string) => s.trim())
                                            : []
                                    };

                                    let newEntry: any = { ...baseEntry };

                                    if (entryType === "HealthCheck") {
                                        newEntry.healthCheckRating = Number(
                                            form.healthCheckRating.value
                                        );
                                    }

                                    if (entryType === "Hospital") {
                                        newEntry.discharge = {
                                            date: form.dischargeDate.value,
                                            criteria: form.dischargeCriteria.value
                                        };
                                    }

                                    if (entryType === "OccupationalHealthcare") {
                                        newEntry.employerName = form.employerName.value;
                                        if (
                                            form.sickLeaveStart.value &&
                                            form.sickLeaveEnd.value
                                        ) {
                                            newEntry.sickLeave = {
                                                startDate: form.sickLeaveStart.value,
                                                endDate: form.sickLeaveEnd.value
                                            };
                                        }
                                    }

                                    try {
                                        const added = await patientsService.addEntry(
                                            patient.id,
                                            newEntry
                                        );
                                        setPatient({
                                            ...patient,
                                            entries: patient.entries.concat(added)
                                        });
                                        setShowForm(false);
                                        setErrorMessage(null);
                                    } catch (error: any) {
                                        console.error(error);
                                        setErrorMessage(error.response?.data || "Unknown error");
                                    }
                                }}
                            >
                                {/* Type selector */}
                                <label>
                                    Entry type:
                                    <select
                                        name="type"
                                        value={entryType}
                                        onChange={(e) =>
                                            setEntryType(e.target.value as EntryType)
                                        }
                                        style={{ width: "100%", margin: "4px 0" }}
                                    >
                                        <option value="HealthCheck">HealthCheck</option>
                                        <option value="Hospital">Hospital</option>
                                        <option value="OccupationalHealthcare">
                                            OccupationalHealthcare
                                        </option>
                                    </select>
                                </label>

                                <input
                                    name="description"
                                    placeholder="Description"
                                    style={{ width: "100%", margin: "4px 0" }}
                                />
                                <input
                                    name="date"
                                    placeholder="2023-01-01"
                                    style={{ width: "100%", margin: "4px 0" }}
                                />
                                <input
                                    name="specialist"
                                    placeholder="Specialist"
                                    style={{ width: "100%", margin: "4px 0" }}
                                />
                                <input
                                    name="diagnosisCodes"
                                    placeholder="Z57.1, M51.2"
                                    style={{ width: "100%", margin: "4px 0" }}
                                />


                                {entryType === "HealthCheck" && (
                                    <input
                                        name="healthCheckRating"
                                        placeholder="HealthCheck rating (0-3)"
                                        style={{ width: "100%", margin: "4px 0" }}
                                    />
                                )}


                                {entryType === "Hospital" && (
                                    <>
                                        <input
                                            name="dischargeDate"
                                            placeholder="Discharge date (2023-01-10)"
                                            style={{ width: "100%", margin: "4px 0" }}
                                        />
                                        <input
                                            name="dischargeCriteria"
                                            placeholder="Discharge criteria"
                                            style={{ width: "100%", margin: "4px 0" }}
                                        />
                                    </>
                                )}


                                {entryType === "OccupationalHealthcare" && (
                                    <>
                                        <input
                                            name="employerName"
                                            placeholder="Employer name"
                                            style={{ width: "100%", margin: "4px 0" }}
                                        />
                                        <input
                                            name="sickLeaveStart"
                                            placeholder="Sick leave start date (optional)"
                                            style={{ width: "100%", margin: "4px 0" }}
                                        />
                                        <input
                                            name="sickLeaveEnd"
                                            placeholder="Sick leave end date (optional)"
                                            style={{ width: "100%", margin: "4px 0" }}
                                        />
                                    </>
                                )}

                                <Box mt={2} display="flex" gap={2}>
                                    <Button variant="contained" color="secondary" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="contained">
                                        Add
                                    </Button>
                                </Box>
                            </form>
                        </Box>
                    )}
                </Box>

                <Box mt={2}>
                    <Typography variant="h6">Entries</Typography>
                    {patient.entries.length === 0 ? (
                        <Typography>No entries</Typography>
                    ) : (
                        patient.entries.map(entry => (
                            <EntryDetails
                                key={entry.id}
                                entry={entry}
                                diagnoses={diagnoses}
                            />
                        ))
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default PatientPage;
