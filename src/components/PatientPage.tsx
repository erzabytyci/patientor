import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";

import patientsService from "../services/patients";
import { Patient, Gender } from "../types";

const PatientPage = () => {
    const { id } = useParams<{ id: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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
                <Typography>Date of birth: {patient.dateOfBirth}</Typography>

                <Box mt={2}>
                    <Typography variant="h6">Entries</Typography>
                    {patient.entries.length === 0 ? (
                        <Typography>No entries</Typography>
                    ) : (
                        <ul>
                            {patient.entries.map((_entry, index) => (
                                <li key={index}>Entry {index + 1}</li>
                            ))}
                        </ul>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default PatientPage;
