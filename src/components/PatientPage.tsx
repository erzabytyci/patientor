import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box, Typography, CircularProgress, Paper, Button,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput,
    Checkbox, ListItemText
} from "@mui/material";

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
    const [selectedDiagnosisCodes, setSelectedDiagnosisCodes] = useState<string[]>([]);


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

    const handleDiagnosisChange = (event: any) => {
        const { value } = event.target;
        setSelectedDiagnosisCodes(typeof value === "string" ? value.split(",") : value);
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
                            <Typography variant="h6">New entry</Typography>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target as any;

                                    const baseEntry: any = {
                                        type: entryType,
                                        description: form.description.value,
                                        date: form.date.value,
                                        specialist: form.specialist.value,
                                        diagnosisCodes: selectedDiagnosisCodes
                                    };

                                    let newEntry: any = { ...baseEntry };

                                    if (entryType === "HealthCheck") {
                                        newEntry.healthCheckRating = Number(form.healthCheckRating.value);
                                    }

                                    if (entryType === "Hospital") {
                                        newEntry.discharge = {
                                            date: form.dischargeDate.value,
                                            criteria: form.dischargeCriteria.value
                                        };
                                    }

                                    if (entryType === "OccupationalHealthcare") {
                                        newEntry.employerName = form.employerName.value;
                                        if (form.sickLeaveStart.value && form.sickLeaveEnd.value) {
                                            newEntry.sickLeave = {
                                                startDate: form.sickLeaveStart.value,
                                                endDate: form.sickLeaveEnd.value
                                            };
                                        }
                                    }

                                    try {
                                        const added = await patientsService.addEntry(patient.id, newEntry);
                                        setPatient({
                                            ...patient,
                                            entries: patient.entries.concat(added)
                                        });
                                        setShowForm(false);
                                        setErrorMessage(null);
                                        setSelectedDiagnosisCodes([]);
                                    } catch (error: any) {
                                        console.error(error);
                                        setErrorMessage(error.response?.data || "Unknown error");
                                    }
                                }}
                            >

                                <FormControl fullWidth margin="dense" size="small">
                                    <InputLabel id="entry-type-label">Entry type</InputLabel>
                                    <Select
                                        labelId="entry-type-label"
                                        label="Entry type"
                                        value={entryType}
                                        onChange={(e) => setEntryType(e.target.value as EntryType)}
                                    >
                                        <MenuItem value="HealthCheck">HealthCheck</MenuItem>
                                        <MenuItem value="Hospital">Hospital</MenuItem>
                                        <MenuItem value="OccupationalHealthcare">
                                            OccupationalHealthcare
                                        </MenuItem>
                                    </Select>
                                </FormControl>


                                <Box mt={1}>
                                    <Typography variant="body2">Description</Typography>
                                    <input
                                        name="description"
                                        style={{ width: "100%", margin: "4px 0" }}
                                    />
                                </Box>

                                <Box mt={1}>
                                    <Typography variant="body2">Entry date</Typography>
                                    <input
                                        type="date"
                                        name="date"
                                        style={{ width: "100%", margin: "4px 0" }}
                                    />
                                </Box>

                                <Box mt={1}>
                                    <Typography variant="body2">Specialist</Typography>
                                    <input
                                        name="specialist"
                                        style={{ width: "100%", margin: "4px 0" }}
                                    />
                                </Box>


                                <Box mt={1}>
                                    <Typography variant="body2">Diagnosis codes</Typography>
                                    <FormControl fullWidth margin="dense" size="small">
                                        <InputLabel id="diagnosis-label">Diagnosis codes</InputLabel>
                                        <Select
                                            labelId="diagnosis-label"
                                            multiple
                                            value={selectedDiagnosisCodes}
                                            onChange={handleDiagnosisChange}
                                            input={<OutlinedInput label="Diagnosis codes" />}
                                            renderValue={(selected) => (selected as string[]).join(", ")}
                                        >
                                            {diagnoses.map((d) => (
                                                <MenuItem key={d.code} value={d.code}>
                                                    <Checkbox
                                                        checked={selectedDiagnosisCodes.indexOf(d.code) > -1}
                                                    />
                                                    <ListItemText primary={`${d.code} ${d.name}`} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>


                                {entryType === "HealthCheck" && (
                                    <Box mt={1}>
                                        <Typography variant="body2">HealthCheck rating (0–3)</Typography>
                                        <select
                                            name="healthCheckRating"
                                            style={{ width: "100%", margin: "4px 0" }}
                                            defaultValue="0"
                                        >
                                            <option value="0">0 - Healthy</option>
                                            <option value="1">1 - Low risk</option>
                                            <option value="2">2 - High risk</option>
                                            <option value="3">3 - Critical risk</option>
                                        </select>
                                    </Box>
                                )}


                                {entryType === "Hospital" && (
                                    <>
                                        <Box mt={1}>
                                            <Typography variant="body2">
                                                Discharge date
                                            </Typography>
                                            <input
                                                type="date"
                                                name="dischargeDate"
                                                style={{ width: "100%", margin: "4px 0" }}
                                            />
                                        </Box>
                                        <Box mt={1}>
                                            <Typography variant="body2">Discharge criteria</Typography>
                                            <input
                                                name="dischargeCriteria"
                                                style={{ width: "100%", margin: "4px 0" }}
                                            />
                                        </Box>
                                    </>
                                )}


                                {entryType === "OccupationalHealthcare" && (
                                    <>
                                        <Box mt={1}>
                                            <Typography variant="body2">Employer name</Typography>
                                            <input
                                                name="employerName"
                                                style={{ width: "100%", margin: "4px 0" }}
                                            />
                                        </Box>

                                        <Box mt={1}>
                                            <Typography variant="body2">
                                                Sick leave start date
                                            </Typography>
                                            <input
                                                type="date"
                                                name="sickLeaveStart"
                                                style={{ width: "100%", margin: "4px 0" }}
                                            />
                                        </Box>

                                        <Box mt={1}>
                                            <Typography variant="body2">
                                                Sick leave end date
                                            </Typography>
                                            <input
                                                type="date"
                                                name="sickLeaveEnd"
                                                style={{ width: "100%", margin: "4px 0" }}
                                            />
                                        </Box>
                                    </>
                                )}

                                <Box mt={2} display="flex" gap={2}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => setShowForm(false)}
                                    >
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
